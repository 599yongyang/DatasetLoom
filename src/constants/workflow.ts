import type { Node } from '@xyflow/react';
import { nanoid } from 'nanoid';

export const initialNodes: Node[] = [
    {
        id: 'start',
        type: 'start',
        position: { x: 0, y: 400 },
        data: {}
    },
    {
        id: 'document',
        type: 'document',
        position: { x: 350, y: 400 },
        data: {}
    },
    {
        id: 'chunker',
        type: 'chunker',
        position: { x: 700, y: 400 },
        data: {}
    },
    {
        id: 'question',
        type: 'question',
        position: { x: 1050, y: 400 },
        data: {}
    },
    {
        id: 'dataset',
        type: 'dataset',
        position: { x: 1450, y: 400 },
        data: {}
    },
    {
        id: 'end',
        type: 'end',
        position: { x: 1750, y: 400 },
        data: {}
    }
];

// 初始连接定义
export const initialEdges = [
    { id: nanoid(), source: 'start', target: 'document' },
    { id: nanoid(), source: 'document', target: 'chunker' },
    { id: nanoid(), source: 'chunker', target: 'question' },
    { id: nanoid(), source: 'question', target: 'dataset' },
    { id: nanoid(), source: 'dataset', target: 'end' }
];
