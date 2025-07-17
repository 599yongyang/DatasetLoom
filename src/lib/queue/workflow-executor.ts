import { db } from '@/server/db/db';
import { WorkflowStatus } from '@/lib/data-dictionary';
import type { DependencyMap, StepMap, WorkflowStepWithNodeData } from '@/lib/dag';
import type { ExecuteDAGResult, TaskResult } from './types';

export class WorkflowExecutor {
    async executeDAG(
        stepMap: StepMap,
        levels: string[][],
        dependencies: DependencyMap,
        workflowId: string,
        projectId: string,
        executeStep: (step: WorkflowStepWithNodeData, inputs: Record<string, any>) => Promise<TaskResult>
    ): Promise<ExecuteDAGResult> {
        const outputCache: Record<string, any> = {};

        for (const level of levels) {
            const levelResults = await Promise.all(
                level.map(async stepName => {
                    const step = stepMap.get(stepName)!;
                    const inputs = this.getStepInputs(stepName, dependencies, outputCache);
                    const result = await executeStep(step, inputs);

                    await this.updateStepStatus(step, result);
                    if (result.success) {
                        outputCache[stepName] = result.data;
                    }
                    return result;
                })
            );

            const failedResult = levelResults.find(r => !r.success);
            if (failedResult) {
                return { success: false, failedStep: failedResult.stepName };
            }
        }

        return { success: true };
    }

    private getStepInputs(
        stepName: string,
        dependencies: DependencyMap,
        outputCache: Record<string, any>
    ): Record<string, any> {
        const inputs: Record<string, any> = {};
        const deps = dependencies.get(stepName) || new Set();

        for (const dep of deps) {
            if (outputCache[dep] !== undefined) {
                inputs[dep] = outputCache[dep];
            }
        }
        return inputs;
    }

    private async updateStepStatus(step: WorkflowStepWithNodeData, result: TaskResult) {
        await db.workflowStep.update({
            where: { id: step.id },
            data: {
                status: result.success ? WorkflowStatus.COMPLETE : WorkflowStatus.FAILED,
                output: JSON.stringify(result.data),
                logs: result.error,
                ...(result.success ? {} : { finishedAt: new Date() })
            }
        });
    }
}
