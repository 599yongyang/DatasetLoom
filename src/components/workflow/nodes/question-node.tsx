import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import BaseNode, { KeyValueRow } from '@/components/workflow/nodes/base-node';
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ModelSelect } from '@/components/model-select';
import { BetweenVerticalStart, Brain, Hash, Thermometer } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';
import { questionsWorkFlowAtom } from '@/atoms/workflow';
import { selectedModelInfoAtom } from '@/atoms';
import { Input } from '@/components/ui/input';

export function QuestionNode({ isConnectable }: NodeProps) {
    const { t } = useTranslation('project');

    const [questionsWorkFlow, setQuestionsWorkFlow] = useAtom(questionsWorkFlowAtom);
    const modelInfo = useAtomValue(selectedModelInfoAtom);
    const handleChange = (field: string, value: string | number) => {
        setQuestionsWorkFlow(prev => ({ ...prev, [field]: value }));
    };

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
                            {questionsWorkFlow.type === 'custom' && (
                                <>
                                    <KeyValueRow label="模型温度" value={questionsWorkFlow.temperature} />
                                    <KeyValueRow label="Max Token" value={questionsWorkFlow.maxTokens} />
                                </>
                            )}
                            <KeyValueRow
                                label="每块生成问题数"
                                value={
                                    questionsWorkFlow.questionCountType === 'auto'
                                        ? '自动'
                                        : questionsWorkFlow.questionCount
                                }
                            />
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
                    <div className="space-y-4 pt-2">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Brain className="h-4 w-4 text-muted-foreground" />
                                    <Label className="font-medium text-base">模型选择</Label>
                                </div>
                                <RadioGroup
                                    className="flex flex-wrap gap-2"
                                    value={questionsWorkFlow.type}
                                    onValueChange={value => handleChange('type', value)}
                                >
                                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none">
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem
                                                value={'default'}
                                                className="after:absolute after:inset-0"
                                            />
                                            <Label>默认</Label>
                                        </div>
                                    </div>
                                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none">
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value={'custom'} className="after:absolute after:inset-0" />
                                            <Label>自定义</Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>
                            {questionsWorkFlow.type === 'custom' && (
                                <div className="px-1">
                                    <ModelSelect type={'workflow-question'} />
                                </div>
                            )}
                        </div>
                        {questionsWorkFlow.type === 'custom' && (
                            <>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Thermometer className="h-4 w-4 text-muted-foreground" />
                                            <Label className="font-medium text-base">
                                                {t('model_dialog.temperature')}
                                            </Label>
                                        </div>
                                        <span className="font-medium text-lg text-primary">
                                            {questionsWorkFlow.temperature}
                                        </span>
                                    </div>
                                    <div className="px-1">
                                        <Slider
                                            value={[questionsWorkFlow.temperature ?? 0.7]}
                                            min={0}
                                            max={2}
                                            step={0.1}
                                            onValueChange={value => handleChange('temperature', value[0] ?? 1)}
                                            className="py-2"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>{t('model_dialog.temperature_accurate')}</span>
                                            <span>{t('model_dialog.temperature_balance')}</span>
                                            <span>{t('model_dialog.temperature_creative')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-4 w-4 text-muted-foreground" />
                                            <Label className="font-medium text-base">
                                                {' '}
                                                {t('model_dialog.max_token')}
                                            </Label>
                                        </div>
                                        <span className="font-medium text-lg text-primary">
                                            {questionsWorkFlow.maxTokens}
                                        </span>
                                    </div>
                                    <div className="px-1">
                                        <Slider
                                            value={[questionsWorkFlow.maxTokens ?? 1024]}
                                            min={1024}
                                            max={32768}
                                            step={1024}
                                            onValueChange={value => handleChange('maxTokens', value[0] ?? 1024)}
                                            className="py-2"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>1K</span>
                                            <span>8K</span>
                                            <span>16K</span>
                                            <span>32K</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BetweenVerticalStart className="h-4 w-4 text-muted-foreground" />
                                    <Label className="font-medium text-base">每块生成问题数</Label>
                                </div>
                                <RadioGroup
                                    className="flex flex-wrap gap-2"
                                    value={questionsWorkFlow.questionCountType}
                                    onValueChange={value => handleChange('questionCountType', value)}
                                >
                                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none">
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value={'auto'} className="after:absolute after:inset-0" />
                                            <Label>自动</Label>
                                        </div>
                                    </div>
                                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none">
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value={'custom'} className="after:absolute after:inset-0" />
                                            <Label>自定义</Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>
                            {questionsWorkFlow.questionCountType === 'custom' && (
                                <div className="px-1">
                                    <Input
                                        type="number"
                                        placeholder="请输入问题数量"
                                        value={questionsWorkFlow.questionCount}
                                        onChange={e => handleChange('questionCount', e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}
