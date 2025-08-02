import type { TaskParams, TaskResult } from '@/lib/queue/types';

export async function startTask(params: TaskParams): Promise<TaskResult> {
    //开始节点--> 以备后续使用执行其他逻辑
    const { step } = params;
    console.log(`【${step.name}】【STEP_ID:${step.id}] 节点开始运行 @ ${new Date().toLocaleString()}`);
    return {
        success: true,
        startedAt: new Date(),
        finishedAt: new Date(),
        stepName: step.name,
        stepId: step.id
    };
}
