import type { DependencyMap, DependentMap, StepMap } from '@/lib/dag/types';

export function topologicalSort(stepMap: StepMap, dependencies: DependencyMap, dependents: DependentMap): string[][] {
    const queue: string[] = [];
    const result: string[][] = []; // 分层结果
    const inDegree = new Map<string, number>();

    for (const name of stepMap.keys()) {
        const deps = dependencies.get(name) || new Set();
        inDegree.set(name, deps.size);
        if (deps.size === 0) {
            queue.push(name);
        }
    }

    while (queue.length > 0) {
        const levelSize = queue.length;
        const level: string[] = [];

        for (let i = 0; i < levelSize; i++) {
            const current = queue.shift()!;
            level.push(current);

            const children = dependents.get(current) || new Set();

            for (const child of children) {
                const count = inDegree.get(child)! - 1;
                inDegree.set(child, count);
                if (count === 0) {
                    queue.push(child);
                }
            }
        }

        result.push(level);
    }

    return result;
}
