import type { Edge, Node } from '@xyflow/react';
import { nanoid } from 'nanoid';

export function getSortedWorkflowNodes(nodes: Node[], edges: Edge[]) {
    const allNodes = new Set(nodes.map(n => n.id));
    const dependentsMap = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    // 初始化
    nodes.forEach(node => {
        dependentsMap.set(node.id, new Set());
        inDegree.set(node.id, 0);
    });

    // 构建依赖关系
    edges.forEach(edge => {
        const { source, target } = edge;

        if (!allNodes.has(source) || !allNodes.has(target)) return;

        dependentsMap.get(source)?.add(target);
        inDegree.set(target, (inDegree.get(target) || 0) + 1);
    });

    // 拓扑排序
    const queue: string[] = [];
    const result: string[] = [];

    for (const node of allNodes) {
        if ((inDegree.get(node) || 0) === 0) {
            queue.push(node);
        }
    }

    while (queue.length > 0) {
        const levelSize = queue.length;

        for (let i = 0; i < levelSize; i++) {
            const current = queue.shift()!;

            result.push(current);

            const children = dependentsMap.get(current) || new Set();

            for (const child of children) {
                const degree = (inDegree.get(child) || 0) - 1;
                inDegree.set(child, degree);
                if (degree === 0) {
                    queue.push(child);
                }
            }
        }
    }

    // 检查是否所有节点都处理了（防止循环）
    if (result.length !== allNodes.size) {
        throw new Error('存在循环依赖');
    }

    // 构建最终结果
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    return result.map((id, index) => {
        const node = nodeMap.get(id)!;
        return {
            name: id,
            sort: index + 1,
            id: nanoid(),
            input: JSON.stringify(node.data)
        };
    });
}
