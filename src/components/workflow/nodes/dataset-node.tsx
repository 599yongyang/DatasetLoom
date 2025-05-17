import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import BaseNode, { KeyValueRow } from '@/components/workflow/nodes/base-node';
import React from 'react';
import { BetweenVerticalStart, Brain, Hash, Thermometer } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ModelSelect } from '@/components/model-select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useAtom, useAtomValue } from 'jotai/index';
import { datasetWorkFlowAtom, questionsWorkFlowAtom } from '@/atoms/workflow';
import { selectedModelInfoAtom } from '@/atoms';
import { useTranslation } from 'react-i18next';

export function DatasetNode({ isConnectable }: NodeProps) {
    const { t } = useTranslation('project');

    const [datasetWorkFlow, setDatasetWorkFlow] = useAtom(datasetWorkFlowAtom);
    const modelInfo = useAtomValue(selectedModelInfoAtom);

    const handleChange = (field: string, value: string | number) => {
        setDatasetWorkFlow(prev => ({ ...prev, [field]: value }));
    };

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
            <SheetContent className={'p-4'}>
                <SheetTitle>生成数据集</SheetTitle>
                <div className="space-y-4 pt-2">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Brain className="h-4 w-4 text-muted-foreground" />
                                <Label className="font-medium text-base">模型选择</Label>
                            </div>
                            <RadioGroup
                                className="flex flex-wrap gap-2"
                                value={datasetWorkFlow.type}
                                onValueChange={value => handleChange('type', value)}
                            >
                                <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none">
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value={'default'} className="after:absolute after:inset-0" />
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
                        {datasetWorkFlow.type === 'custom' && (
                            <div className="px-1">
                                <ModelSelect type={'workflow-dataset'} />
                            </div>
                        )}
                    </div>
                    {datasetWorkFlow.type === 'custom' && (
                        <>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Thermometer className="h-4 w-4 text-muted-foreground" />
                                        <Label className="font-medium text-base">{t('model_dialog.temperature')}</Label>
                                    </div>
                                    <span className="font-medium text-lg text-primary">
                                        {datasetWorkFlow.temperature}
                                    </span>
                                </div>
                                <div className="px-1">
                                    <Slider
                                        value={[datasetWorkFlow.temperature ?? 0.7]}
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
                                        <Label className="font-medium text-base"> {t('model_dialog.max_token')}</Label>
                                    </div>
                                    <span className="font-medium text-lg text-primary">
                                        {datasetWorkFlow.maxTokens}
                                    </span>
                                </div>
                                <div className="px-1">
                                    <Slider
                                        value={[datasetWorkFlow.maxTokens ?? 1024]}
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
                </div>
            </SheetContent>
        </Sheet>
    );
}
