import type { TaskResult } from '@/lib/queue';
import type { WorkflowStepWithNodeData } from '@/lib/dag';

export async function documentTask(step: WorkflowStepWithNodeData): Promise<TaskResult> {
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
