import type { WorkflowStep } from '@prisma/client';
import type { Node } from '@xyflow/react';

export type WorkflowStepWithNodeData = WorkflowStep & {
    data: Node['data'] | undefined;
};

export type StepMap = Map<string, WorkflowStepWithNodeData>;
export type DependencyMap = Map<string, Set<string>>;
export type DependentMap = Map<string, Set<string>>;

export interface Edge {
    id: string;
    source: string;
    target: string;
}

export interface DAGStepInfo {
    step: number;
    title: string;
    description: string;
}
