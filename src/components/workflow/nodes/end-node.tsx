import { Handle, type NodeProps, Position } from '@xyflow/react';
import BaseNode from '@/components/workflow/nodes/base-node';
import React from 'react';

export function EndNode({ data, isConnectable }: NodeProps) {
    return (
        <BaseNode>
            <BaseNode.Header className={'bg-red-600'}>结束</BaseNode.Header>
            <BaseNode.Body>
                <div className=" text-sm text-gray-700 dark:text-gray-300">工作流程完成</div>
            </BaseNode.Body>
            {/* Handle */}
            <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
        </BaseNode>
    );
}
