import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import BaseNode, { KeyValueRow } from '@/components/workflow/nodes/base-node';
import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { questionsWorkFlowAtom } from '@/atoms/workflow';
import { selectedModelInfoAtom } from '@/atoms';
import { QuestionStrategyForm } from '@/components/questions/question-strategy-form';
import { difficultyMap, styleMap } from '@/constants/prompt';

export function QuestionNode({ isConnectable }: NodeProps) {
    const [questionsWorkFlow, setQuestionsWorkFlow] = useAtom(questionsWorkFlowAtom);
    const modelInfo = useAtomValue(selectedModelInfoAtom);
    return (
        <Sheet>
            <SheetTrigger>
                <BaseNode className={'w-100'}>
                    <BaseNode.Header className={'bg-teal-700'}>生成问题</BaseNode.Header>
                    <BaseNode.Body className="p-3 space-y-3 text-sm">
                        {/* 描述 */}
                        <div className="text-gray-700 dark:text-gray-300">基于分块内容生成相关问题</div>

                        {/* 配置项列表 */}
                        <div className="space-y-2">
                            <KeyValueRow
                                label="模型选择"
                                value={
                                    questionsWorkFlow.type === 'default'
                                        ? modelInfo?.modelName
                                        : questionsWorkFlow.modelName
                                }
                            />
                            <KeyValueRow
                                label="每块生成问题数"
                                value={
                                    questionsWorkFlow.questionCountType === 'auto'
                                        ? '自动'
                                        : questionsWorkFlow.questionCount
                                }
                            />
                            <KeyValueRow label="问题风格" value={styleMap[questionsWorkFlow.genre]} />
                            <KeyValueRow label="难度级别" value={difficultyMap[questionsWorkFlow.difficulty]?.depth} />
                            <KeyValueRow label="受众人群" value={questionsWorkFlow.audience} />
                            {questionsWorkFlow.type === 'custom' && (
                                <>
                                    <KeyValueRow label="模型温度" value={questionsWorkFlow.temperature} />
                                    <KeyValueRow label="Max Token" value={questionsWorkFlow.maxTokens} />
                                </>
                            )}
                        </div>
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
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>生成问题配置</SheetTitle>
                    <QuestionStrategyForm
                        type={'workflow'}
                        questionStrategy={questionsWorkFlow}
                        setQuestionStrategy={setQuestionsWorkFlow}
                    />
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}
