'use client';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { type Node, type Edge } from '@xyflow/react';
import { edgesAtom, nodesAtom } from '@/atoms/workflow';

export function useInitFlow() {
    const [, setNodes] = useAtom(nodesAtom);
    const [, setEdges] = useAtom(edgesAtom);

    useEffect(() => {
        const initialNodes: Node[] = [
            {
                id: '1',
                type: 'start',
                position: { x: 250, y: 50 },
                data: { label: '开始' }
            },
            {
                id: '2',
                type: 'upload',
                position: { x: 250, y: 150 },
                data: { label: '上传文档' }
            },
            {
                id: '3',
                type: 'chunk',
                position: { x: 250, y: 250 },
                data: { label: '分块策略' }
            },
            {
                id: '4',
                type: 'question',
                position: { x: 250, y: 350 },
                data: { label: '生成问题' }
            },
            {
                id: '5',
                type: 'dataset',
                position: { x: 250, y: 450 },
                data: { label: '生成数据集' }
            },
            {
                id: '6',
                type: 'end',
                position: { x: 250, y: 550 },
                data: { label: '结束' }
            }
        ];

        const initialEdges: Edge[] = [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' },
            { id: 'e4-5', source: '4', target: '5' },
            { id: 'e5-6', source: '5', target: '6' }
        ];

        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [setNodes, setEdges]);
}
