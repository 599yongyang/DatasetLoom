import type { WorkflowStepWithNodeData } from '@/lib/dag';

export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    tls?: Record<string, unknown>;
}

export interface WorkerOptions {
    concurrency?: number;
    autoStart?: boolean;
}

export interface ScheduleOptions {
    force?: boolean;
    immediate?: boolean;
}

export interface TaskParams {
    step: WorkflowStepWithNodeData;
    inputs: any;
    workflowId: string;
    projectId: string;
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

export interface ExecuteDAGResult {
    success: boolean;
    failedStep?: string;
}
