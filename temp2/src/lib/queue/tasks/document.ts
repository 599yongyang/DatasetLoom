import type { TaskParams, TaskResult } from '@/lib/queue/types';

export async function documentTask(params: TaskParams): Promise<TaskResult> {
    const { step } = params;
    console.log(`【${step.name}】【STEP_ID:${step.id}] 节点开始运行 @ ${new Date().toLocaleString()}`);
    return {
        success: true,
        data: step.data,
        startedAt: new Date(),
        finishedAt: new Date(),
        stepName: step.name,
        stepId: step.id
    };
}
