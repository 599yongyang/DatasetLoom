import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import BaseNode, { KeyValueRow } from '@/components/workflow/nodes/base-node';
import React from 'react';
import { useAtom, useAtomValue } from 'jotai/index';
import { datasetWorkFlowAtom } from '@/atoms/workflow';
import { selectedModelInfoAtom } from '@/atoms';
import { DatasetStrategyForm } from '@/components/dataset/dataset-strategy-form';
import { answerStyleMap, detailRuleMap } from '@/constants/prompt';

export function DatasetNode({ isConnectable }: NodeProps) {
    const [datasetWorkFlow, setDatasetWorkFlow] = useAtom(datasetWorkFlowAtom);
    const modelInfo = useAtomValue(selectedModelInfoAtom);
    return (
        <Sheet>
            <SheetTrigger>
                <BaseNode className={'w-100'}>
                    <BaseNode.Header className={'bg-purple-700'}>生成数据集</BaseNode.Header>
                    <BaseNode.Body className="p-3 space-y-3 text-sm">
                        <div className="text-sm text-gray-700 dark:text-gray-300">将问题和答案组合成训练数据集</div>
                        <KeyValueRow
                            label="模型选择"
                            value={
                                datasetWorkFlow.type === 'default' ? modelInfo?.modelName : datasetWorkFlow.modelName
                            }
                        />
                        {datasetWorkFlow.type === 'custom' && (
                            <>
                                <KeyValueRow label="模型温度" value={datasetWorkFlow.temperature} />
                                <KeyValueRow label="Max Token" value={datasetWorkFlow.maxTokens} />
                            </>
                        )}
                        <KeyValueRow label="答案风格" value={answerStyleMap[datasetWorkFlow.answerStyle]} />
                        <KeyValueRow label="答案详细程度" value={detailRuleMap[datasetWorkFlow.detailLevel]} />
                        <KeyValueRow label="记录引用" value={datasetWorkFlow.citation ? '是' : '否'} />
                    </BaseNode.Body>
                    {/* Handles */}
                    <Handle
                        type="target"
                        position={Position.Left}
                        isConnectable={isConnectable}
                        className="w-4 h-4 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full hover:brightness-110 transition-all duration-200"
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        isConnectable={isConnectable}
                        className="w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full hover:brightness-110 transition-all duration-200"
                    />
                </BaseNode>
            </SheetTrigger>
            <SheetContent className="p-4 w-full sm:max-w-md max-h-screen ">
                <SheetTitle>生成数据集</SheetTitle>
                <DatasetStrategyForm
                    type={'workflow'}
                    datasetStrategy={datasetWorkFlow}
                    setDatasetStrategy={setDatasetWorkFlow}
                />
            </SheetContent>
        </Sheet>
    );
}
