import { Job, Queue, Worker } from 'bullmq';
import { db } from '@/server/db';
import { WorkflowStatus } from '@/lib/data-dictionary';
import { documentTask } from '@/lib/queue/tasks/document';
import { startTask } from '@/lib/queue/tasks/start';
import { chunkerTask } from '@/lib/queue/tasks/chunker';
import {
    buildGraph,
    type DependencyMap,
    type StepMap,
    topologicalSort,
    type WorkflowStepWithNodeData
} from '@/lib/dag';
import { questionTask } from '@/lib/queue/tasks/question';
import { datasetTask } from '@/lib/queue/tasks/dataset';
import Redis from 'ioredis';

interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    tls?: Record<string, unknown>;
}

export async function checkRedisConnection() {
    const client = new Redis(getRedisConfig());
    try {
        const pong = await client.ping();
        console.log('✅ Redis 连接正常:', pong);
        return pong === 'PONG';
    } catch (error) {
        console.error('❌ Redis 连接异常');
        return false;
    } finally {
        await client.quit(); // 关闭连接
    }
}

function getRedisConfig(): RedisConfig {
    return {
        host: process.env.REDIS_URL || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        ...(process.env.REDIS_TLS === 'true' ? { tls: {} } : {})
    };
}

export interface TaskResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    startedAt: Date;
    finishedAt: Date;
    stepName: string;
    stepId: string;
}

export interface TaskParams {
    step: WorkflowStepWithNodeData;
    inputs: any;
    workflowId: string;
    projectId: string;
}

class QueueService {
    private static instance: QueueService;
    private workflowQueue: Queue;
    private worker: Worker | null = null;

    private constructor() {
        this.workflowQueue = new Queue('workflow', { connection: getRedisConfig() });
    }

    public static getInstance(): QueueService {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }
        return QueueService.instance;
    }

    public async initializeWorker() {
        if (this.worker) {
            console.warn('Worker already initialized');
            return;
        }

        this.worker = new Worker('workflow', this.processWorkflow.bind(this), {
            connection: getRedisConfig(),
            concurrency: 5
        });

        this.worker
            .on('ready', () => console.log('✅ Worker is ready'))
            .on('completed', job => console.log(`✅ Job completed: ${job.id}`))
            .on('failed', (job, err) => console.error(`❌ Job failed: ${job?.id}`, err))
            .on('error', err => console.error('❌ Worker error:', err))
            .on('closed', () => {
                console.log('🛑 Worker closed');
                this.worker = null;
            });

        console.log('🚀 Workflow worker initialized');
    }

    public async closeWorker() {
        if (this.worker) {
            await this.worker.close();
            this.worker = null;
        }
    }

    public async scheduleWorkflow(workflowId: string, projectId: string) {
        const workflow = await db.workFlow.findUnique({
            where: { id: workflowId }
        });

        if (!workflow) throw new Error(`Project ${projectId} --> Workflow ${workflowId} not found`);

        const jobId = workflow.isScheduled ? `repeat:${projectId}-${workflowId}` : `once:${projectId}-${workflowId}`;
        const existingJob = await this.workflowQueue.getJob(jobId);

        if (existingJob) {
            await existingJob.remove();
        }

        if (workflow.isScheduled && workflow.cronExpression) {
            await this.workflowQueue.add(
                'process-workflow',
                { workflowId, projectId },
                {
                    jobId,
                    repeat: { pattern: workflow.cronExpression },
                    attempts: workflow.maxRetries || 3,
                    backoff: { type: 'exponential', delay: 1000 }
                }
            );
        } else if (workflow.runAt) {
            const delay = Math.max(new Date(workflow.runAt).getTime() - Date.now(), 0);
            await this.workflowQueue.add(
                'process-workflow',
                { workflowId, projectId },
                {
                    jobId,
                    delay,
                    attempts: workflow.maxRetries || 3,
                    backoff: { type: 'exponential', delay: 1000 }
                }
            );
        }
    }

    private async processWorkflow(job: Job<{ workflowId: string; projectId: string }>) {
        const { workflowId, projectId } = job.data;
        console.log('processWorkflow', workflowId);
        // 获取工作流和步骤
        const workflow = await db.workFlow.findUnique({
            where: { id: workflowId },
            include: { steps: true }
        });
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }
        // 更新工作流状态为运行中
        await db.workFlow.update({
            where: { id: workflowId },
            data: { status: WorkflowStatus.RUNNING, startedAt: new Date() }
        });
        const edges = JSON.parse(workflow.edges);
        const nodes = JSON.parse(workflow.nodes);
        const { stepMap, dependencies, dependents } = buildGraph(workflow.steps, edges, nodes);
        const levels = topologicalSort(stepMap, dependencies, dependents);

        try {
            await this.executeDAG(stepMap, levels, dependencies, workflowId, projectId);

            await db.workFlow.update({
                where: { id: workflowId },
                data: { status: WorkflowStatus.COMPLETE, finishedAt: new Date() }
            });
        } catch (error) {
            await db.workFlow.update({
                where: { id: workflowId },
                data: { status: WorkflowStatus.FAILED, finishedAt: new Date() }
            });
            throw error;
        }
    }

    private async executeDAG(
        stepMap: StepMap,
        levels: string[][],
        dependencies: DependencyMap,
        workflowId: string,
        projectId: string
    ) {
        const outputCache: Record<string, any> = {};
        let hasFailure = false; // 跟踪是否发生失败

        for (const level of levels) {
            if (hasFailure) break; // 如果已有失败，直接跳出循环

            const levelResults = await Promise.all(
                level.map(async stepName => {
                    if (hasFailure) return null; // 如果已有失败，跳过当前步骤

                    const step = stepMap.get(stepName)!;

                    try {
                        // 获取依赖项的输出
                        const inputs: Record<string, any> = {};
                        const deps = dependencies.get(stepName) || new Set();

                        for (const dep of deps) {
                            const depStep = stepMap.get(dep);
                            if (depStep) {
                                inputs[dep] = outputCache[dep];
                            }
                        }

                        await db.workflowStep.update({
                            where: { id: step.id },
                            data: { status: WorkflowStatus.RUNNING }
                        });

                        // 执行当前步骤
                        const taskResult = await this.executeStep(step, inputs, workflowId, projectId);

                        if (!taskResult.success) {
                            hasFailure = true; // 标记失败状态
                            console.log(`Task ${stepName} failed`);
                        } else {
                            outputCache[stepName] = taskResult.data; // 缓存成功输出
                        }

                        // 更新数据库
                        await db.workflowStep.update({
                            where: { id: step.id },
                            data: {
                                status: taskResult.success ? WorkflowStatus.COMPLETE : WorkflowStatus.FAILED,
                                startedAt: taskResult.startedAt,
                                finishedAt: taskResult.finishedAt,
                                output: JSON.stringify(taskResult.data),
                                logs: taskResult.error
                            }
                        });

                        return taskResult;
                    } catch (error) {
                        hasFailure = true;
                        await db.workflowStep.update({
                            where: { id: step.id },
                            data: {
                                status: WorkflowStatus.FAILED,
                                finishedAt: new Date(),
                                logs: error instanceof Error ? error.message : String(error)
                            }
                        });
                        return null;
                    }
                })
            );

            // 检查本层级是否有失败
            if (levelResults.some(result => result && !result.success)) {
                hasFailure = true;
            }
        }

        if (hasFailure) {
            throw new Error('工作流执行过程中有节点失败，已终止后续执行');
        }
    }

    private async executeStep(
        step: WorkflowStepWithNodeData,
        inputs: Record<string, any>,
        workflowId: string,
        projectId: string
    ): Promise<TaskResult> {
        switch (step.name) {
            case 'start':
                return await startTask(step);
            case 'document':
                return await documentTask(step);
            case 'chunker':
                return await chunkerTask({ step, inputs, workflowId, projectId });
            case 'question':
                return await questionTask({ step, inputs, workflowId, projectId });
            case 'dataset':
                return await datasetTask({ step, inputs, workflowId, projectId });
            case 'end':
                return await startTask(step);
            default:
                throw new Error('Unknown step');
        }
    }
}

const queueService = QueueService.getInstance();
export default queueService;
