import { Job, Queue, Worker } from 'bullmq';
import { db } from '@/server/db';
import { WorkflowStatus } from '@/lib/data-dictionary';
import { buildGraph, topologicalSort, type WorkflowStepWithNodeData } from '@/lib/dag';
import { RedisClient } from './redis-client';
import { WorkflowExecutor } from './workflow-executor';
import type { WorkerOptions, ScheduleOptions, TaskResult } from './types';
import { executeTask } from '@/lib/queue/tasks';

export class QueueService {
    private static instance: QueueService;
    private workflowQueue: Queue | null = null;
    private worker: Worker | null = null;
    private executor = new WorkflowExecutor();
    private serviceAvailable = false;

    private constructor() {}

    public static async getInstance(): Promise<QueueService> {
        if (!this.instance) {
            this.instance = new QueueService();
            await this.instance.initialize();
        }
        return this.instance;
    }

    public isAvailable(): boolean {
        return this.serviceAvailable;
    }

    public isWorkerRunning(): boolean {
        return !!this.worker && this.worker.isRunning();
    }

    public async initializeWorker(options: WorkerOptions = {}): Promise<boolean> {
        if (!this.isAvailable()) {
            console.log('[QueueService] Service unavailable, skipping worker init');
            return false;
        }

        if (this.isWorkerRunning()) {
            console.log('[Worker] Worker already running');
            return true;
        }

        try {
            this.worker = new Worker('workflow', this.processWorkflow.bind(this), {
                connection: RedisClient.getInstance(),
                concurrency: options.concurrency || 5,
                removeOnComplete: { count: 100 },
                removeOnFail: { count: 100 }
            });

            this.setupWorkerEvents();
            console.log('[QueueService] Worker initialized');

            if (options.autoStart !== false) {
                await this.worker.waitUntilReady();
            }

            return true;
        } catch (error) {
            console.error('[QueueService] Worker init failed:', error);
            this.worker = null;
            return false;
        }
    }

    public async scheduleWorkflow(
        workflowId: string,
        projectId: string,
        options: ScheduleOptions = {}
    ): Promise<boolean> {
        if (!this.isAvailable() || !this.workflowQueue) {
            console.log('[QueueService] Service unavailable, skipping scheduling');
            return false;
        }

        const jobId = `workflow:${projectId}:${workflowId}`;

        try {
            const workflow = await db.workFlow.findUnique({
                where: { id: workflowId },
                select: {
                    isScheduled: true,
                    cronExpression: true,
                    runAt: true,
                    maxRetries: true
                }
            });

            if (!workflow) {
                console.log(`[QueueService] Workflow not found: ${workflowId}`);
                return false;
            }

            if (options.force) {
                await this.removeExistingJob(jobId);
            }

            const jobOptions = {
                jobId,
                attempts: workflow.maxRetries || 3,
                backoff: { type: 'exponential', delay: 1000 }
            };

            if (workflow.isScheduled && workflow.cronExpression) {
                await this.workflowQueue.add(
                    'process-workflow',
                    { workflowId, projectId },
                    { ...jobOptions, repeat: { pattern: workflow.cronExpression } }
                );
            } else if (workflow.runAt) {
                const delay = Math.max(new Date(workflow.runAt).getTime() - Date.now(), 0);
                await this.workflowQueue.add('process-workflow', { workflowId, projectId }, { ...jobOptions, delay });
            } else if (options.immediate) {
                await this.workflowQueue.add(
                    'process-workflow',
                    { workflowId, projectId },
                    { ...jobOptions, priority: 1 }
                );
            }

            return true;
        } catch (error) {
            console.error(`[QueueService] Scheduling failed: ${error}`);
            return false;
        }
    }

    public async deleteWorkflow(workflowId: string, projectId: string): Promise<boolean> {
        if (!this.isAvailable()) return false;
        return this.removeExistingJob(`workflow:${projectId}:${workflowId}`);
    }

    public async shutdown(): Promise<void> {
        const shutdownTasks = [];
        if (this.worker) shutdownTasks.push(this.worker.close());
        if (this.workflowQueue) shutdownTasks.push(this.workflowQueue.close());
        await Promise.all(shutdownTasks);
        this.serviceAvailable = false;
    }

    private async initialize(): Promise<void> {
        try {
            this.workflowQueue = new Queue('workflow', {
                connection: RedisClient.getInstance()
            });
            this.serviceAvailable = true;
        } catch (error) {
            console.error('[QueueService] Initialization failed:', error);
            this.serviceAvailable = false;
        }
    }

    private async removeExistingJob(jobId: string): Promise<boolean> {
        if (!this.workflowQueue) return false;
        const job = await this.workflowQueue.getJob(jobId);
        if (job) {
            await job.remove();
            return true;
        }
        return false;
    }

    private setupWorkerEvents(): void {
        if (!this.worker) return;

        this.worker
            .on('ready', () => console.log('[Worker] Ready'))
            .on('active', job => console.log(`[Worker] Processing job: ${job.id}`))
            .on('completed', job => console.log(`[Worker] Job completed: ${job.id}`))
            .on('failed', (job, err) => console.error(`[Worker] Job failed: ${job?.id}`, err))
            .on('error', err => console.error('[Worker] Error:', err));
    }

    private async processWorkflow(job: Job<{ workflowId: string; projectId: string }>): Promise<void> {
        const { workflowId, projectId } = job.data;

        try {
            const workflow = await db.workFlow.findUnique({
                where: { id: workflowId },
                include: { steps: true }
            });

            if (!workflow) {
                throw new Error(`Workflow not found: ${workflowId}`);
            }

            await db.workFlow.update({
                where: { id: workflowId },
                data: { status: WorkflowStatus.RUNNING, startedAt: new Date() }
            });

            const edges = JSON.parse(workflow.edges);
            const nodes = JSON.parse(workflow.nodes);
            const { stepMap, dependencies, dependents } = buildGraph(workflow.steps, edges, nodes);
            const levels = topologicalSort(stepMap, dependencies, dependents);

            const { success, failedStep } = await this.executor.executeDAG(
                stepMap,
                levels,
                dependencies,
                workflowId,
                projectId,
                (step, inputs) => this.executeStep(step, inputs, workflowId, projectId)
            );

            await db.workFlow.update({
                where: { id: workflowId },
                data: {
                    status: success ? WorkflowStatus.COMPLETE : WorkflowStatus.FAILED,
                    finishedAt: new Date()
                }
            });
        } catch (error) {
            await db.workFlow.update({
                where: { id: workflowId },
                data: {
                    status: WorkflowStatus.FAILED,
                    finishedAt: new Date()
                }
            });
            throw error;
        }
    }

    private async executeStep(
        step: WorkflowStepWithNodeData,
        inputs: Record<string, any>,
        workflowId: string,
        projectId: string
    ): Promise<TaskResult> {
        const startedAt = new Date();
        try {
            const result = await executeTask({ step, inputs, workflowId, projectId });
            return {
                ...result,
                startedAt,
                finishedAt: new Date(),
                stepName: step.name,
                stepId: step.id
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                startedAt,
                finishedAt: new Date(),
                stepName: step.name,
                stepId: step.id
            };
        }
    }
}
