import type { WorkflowStep } from '@prisma/client';
import type { Node } from '@xyflow/react';
import type { DependencyMap, DependentMap, Edge, StepMap } from '@/lib/dag/types';

export function buildGraph(steps: WorkflowStep[], edges: Edge[], nodes: Node[]) {
    const stepMap: StepMap = new Map();
    const dependencies: DependencyMap = new Map();
    const dependents: DependentMap = new Map();

    steps.forEach(step => {
        const node = nodes.find(n => n.id === step.name);
        stepMap.set(step.name, {
            ...step,
            data: node?.data || {} // 将 node.data 合并进 step
        });
        dependencies.set(step.name, new Set());
        dependents.set(step.name, new Set());
    });

    edges.forEach(edge => {
        const source = edge.source;
        const target = edge.target;

        if (dependencies.has(target)) {
            dependencies.get(target)?.add(source);
        }
        if (dependents.has(source)) {
            dependents.get(source)?.add(target);
        }
    });

    return { stepMap, dependencies, dependents };
}
