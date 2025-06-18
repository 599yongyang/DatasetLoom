import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, FileText, Hash, Palette, Quote, Thermometer, Wand } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SelectContent } from '@/components/ui/select';
import { answerStyleMap, detailRuleMap } from '@/constants/prompt';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { DatasetStrategyParams } from '@/types/dataset';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ModelSelect } from '@/components/common/model-select';
import { useAtomValue, useSetAtom } from 'jotai/index';
import { modelConfigListAtom } from '@/atoms';
import { datasetWorkFlowAtom } from '@/atoms/workflow';

export function DatasetStrategyForm({
    type,
    datasetStrategy,
    setDatasetStrategy
}: {
    type: 'question' | 'workflow';
    datasetStrategy: DatasetStrategyParams;
    setDatasetStrategy: React.Dispatch<React.SetStateAction<DatasetStrategyParams>>;
}) {
    const { t } = useTranslation(['dataset', 'project']);
    const tDataset = (key: string) => t(`dataset:${key}`);
    const tProject = (key: string) => t(`project:${key}`);

    const modelConfigList = useAtomValue(modelConfigListAtom);
    const setDatasetWorkFlow = useSetAtom(datasetWorkFlowAtom);
    const [modelValue, setModelValue] = useState('');

    const handleChange = (field: keyof DatasetStrategyParams, value: string | number | boolean) => {
        setDatasetStrategy(prev => ({
            ...prev,
            [field]: value
        }));
    };

    useEffect(() => {
        let modelConfig = modelConfigList.find(modelConfig => modelConfig.id === modelValue);
        if (modelConfig) {
            const { modelName, id: modelConfigId, temperature, maxTokens } = modelConfig;
            setDatasetWorkFlow(prev => ({ ...prev, modelName, modelConfigId, temperature, maxTokens }));
            // setModelName(modelName);
        }
    }, [modelValue]);

    return (
        <div className="space-y-3">
            {type === 'workflow' && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-muted-foreground" />
                        <Label className="font-medium text-base">{tDataset('strategy_form.model')}</Label>
                    </div>
                    <RadioGroup
                        className="flex flex-wrap gap-2"
                        value={datasetStrategy.type}
                        onValueChange={value => handleChange('type', value)}
                    >
                        <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value={'default'} className="after:absolute after:inset-0" />
                                <Label>{tDataset('strategy_form.model_type.default')}</Label>
                            </div>
                        </div>
                        <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value={'custom'} className="after:absolute after:inset-0" />
                                <Label>{tDataset('strategy_form.model_type.custom')}</Label>
                            </div>
                        </div>
                    </RadioGroup>
                </div>
            )}
            {datasetStrategy.type === 'custom' && (
                <div className="px-1">
                    <ModelSelect value={modelValue} setValue={setModelValue} />
                </div>
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium ">{tDataset('strategy_form.answer_style')}</Label>
                </div>
                <Select value={datasetStrategy.answerStyle} onValueChange={value => handleChange('answerStyle', value)}>
                    <SelectTrigger className={'w-65'}>
                        <SelectValue placeholder="Select AnswerStyle" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(answerStyleMap).map(([key, value]) => (
                            <SelectItem value={key}>{value}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium ">{tDataset('strategy_form.detail_level')}</Label>
                </div>
                <Select value={datasetStrategy.detailLevel} onValueChange={value => handleChange('detailLevel', value)}>
                    <SelectTrigger className={'w-65'}>
                        <SelectValue placeholder="Select DetailLevel" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(detailRuleMap).map(([key, value]) => (
                            <SelectItem value={key}>{value}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Quote className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium ">{tDataset('strategy_form.citation')}</Label>
                </div>
                <RadioGroup
                    className="flex flex-wrap gap-2"
                    value={datasetStrategy.citation.toString()}
                    onValueChange={value => handleChange('citation', value === 'true')}
                >
                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none">
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value={'true'} className="after:absolute after:inset-0" />
                            <Label>{tDataset('strategy_form.citation_option.yes')}</Label>
                        </div>
                    </div>
                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none">
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value={'false'} className="after:absolute after:inset-0" />
                            <Label>{tDataset('strategy_form.citation_option.no')}</Label>
                        </div>
                    </div>
                </RadioGroup>
            </div>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={'more'} className="py-2">
                    <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
                        {tDataset('strategy_form.more_setting')}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-2">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                                    <Label className="font-medium">{tProject('model_dialog.temperature')}</Label>
                                </div>
                                <span className="font-medium  text-primary">{datasetStrategy.temperature}</span>
                            </div>
                            <div className="px-1">
                                <Slider
                                    value={[datasetStrategy.temperature]}
                                    min={0}
                                    max={2}
                                    step={0.1}
                                    onValueChange={value => handleChange('temperature', value[0] ?? 1)}
                                    className="py-2"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>{tProject('model_dialog.temperature_accurate')}</span>
                                    <span>{tProject('model_dialog.temperature_balance')}</span>
                                    <span>{tProject('model_dialog.temperature_creative')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                    <Label className="font-medium "> {tProject('model_dialog.max_token')}</Label>
                                </div>
                                <span className="font-medium text-lg text-primary">{datasetStrategy.maxTokens}</span>
                            </div>
                            <div className="px-1">
                                <Slider
                                    value={[datasetStrategy.maxTokens ?? 1024]}
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
                                    <span>24K</span>
                                    <span>32K</span>
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
