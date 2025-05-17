// components/StartNode.tsx
import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import BaseNode from '@/components/workflow/nodes/base-node';

export function StartNode({ data, isConnectable }: NodeProps) {
    return (
        <BaseNode>
            <BaseNode.Header className={'bg-green-500'}>开始</BaseNode.Header>
            <BaseNode.Body>
                <div className=" text-sm text-gray-700 dark:text-gray-300">工作流开始点</div>
            </BaseNode.Body>
            {/* Handle */}
            <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
        </BaseNode>
    );
}
