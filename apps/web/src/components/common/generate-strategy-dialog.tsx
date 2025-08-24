import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAtomValue } from 'jotai';
import { modelConfigListAtom, selectedModelInfoAtom } from '@/atoms';
import { VariablesConfig } from '@/types/form';
import { useDynamicForm } from '@/hooks/use-dynamic-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Hash, Thermometer } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { DynamicConfigForm, DynamicFormRef } from '@/components/prompt-template/dynamic-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetPromptTemplateSelect } from '@/hooks/query/use-prompt-template';
import { ModelConfigType, PromptTemplateType } from '@repo/shared-types';
import { ModelSelect } from '@/components/common/model-select';
import { defaultStrategyConfig, StrategyParamsType } from '@/types/generate';
import { toast } from 'sonner';

export function GenerateStrategyDialog({ open, setOpen, promptTemplateType, handleGenerate }: {
    open: boolean;
    setOpen: (open: boolean) => void;
    promptTemplateType: PromptTemplateType;
    handleGenerate: (strategyParams: StrategyParamsType) => void;
}) {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation(['common', 'project']);
    const tProject = (key: string) => t(`project:${key}`);
    const tCommon = (key: string) => t(`common:${key}`);
    const modelList = useAtomValue(modelConfigListAtom);
    const selectModel = useAtomValue(selectedModelInfoAtom);
    const [modelValue, setModelValue] = useState(selectModel?.type?.includes(ModelConfigType.EMBED) ? '' : selectModel.id);
    const { handleFormChange, handleValidityChange, getFormData } = useDynamicForm();
    const formRef = useRef<DynamicFormRef>(null);
    const { data: promptTemplates } = useGetPromptTemplateSelect({ projectId, type: promptTemplateType });
    const [variablesConfig, setVariablesConfig] = useState<VariablesConfig | undefined>(promptTemplates?.[0]?.variables);
    const [strategy, setStrategy] = useState({
        ...defaultStrategyConfig,
        templateId: promptTemplates?.[0]?.id ?? ''
    });

    useEffect(() => {
        const model = modelList.find(model => model.id === modelValue);
        setStrategy(prev => ({
            ...prev,
            modelConfigId: modelValue,
            modelName: model?.modelName ?? '未知',
            temperature: model?.temperature ?? 0.7,
            maxTokens: model?.maxTokens ?? 8192
        }));
    }, [modelValue, modelList]);


    useEffect(() => {
        setVariablesConfig(promptTemplates?.find(template => template.id === strategy.templateId)?.variables);
    }, [strategy.templateId]);

    useEffect(() => {
        setStrategy(prev => ({
            ...prev,
            templateId: promptTemplates?.[0]?.id ?? ''
        }));
    }, [promptTemplates]);

    const handleGenerateQuestion = async () => {
        const isFormValid = await formRef.current?.validate();
        if (!isFormValid) {
            return;
        }
        if (!modelValue) {
            toast.warning('请选择模型');
            return;
        }
        handleGenerate({ ...strategy, variablesData: getFormData() });
    };

    const handleChange = (field: string, value: string | number) => {
        setStrategy(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                className="flex flex-col gap-0 p-0 sm:max-h-[min(900px,86vh)] sm:max-w-lg [&>button:last-child]:top-3.5">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle
                        className="border-b px-6 py-4 text-base">{tCommon('strategy_dialog.title')}</DialogTitle>
                    <div className="flex flex-col overflow-y-auto px-4 gap-2.5 text-sm">
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                <Label className="font-medium ">{tCommon('strategy_dialog.ai_model')}</Label>
                            </div>
                            <ModelSelect
                                value={modelValue}
                                setValue={setModelValue}
                                className={'w-[350]'}
                                exclude={ModelConfigType.EMBED}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Label className="font-medium ">{tCommon('strategy_dialog.prompt')}</Label>
                            </div>
                            <Select value={strategy.templateId}
                                    onValueChange={(value) => handleChange('templateId', value)}>
                                <SelectTrigger className={'w-[350]'}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {promptTemplates?.map((data) => (
                                        <SelectItem key={data.id} value={data.id}>
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">{data.name}</span>
                                                <span className="text-xs text-gray-500">{data.description}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {variablesConfig && (
                            <DynamicConfigForm
                                className={'mt-2'}
                                ref={formRef}
                                variables={variablesConfig}
                                onChange={handleFormChange}
                                onValidityChange={handleValidityChange}
                            />
                        )}
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value={'more'} className="py-2">
                                <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
                                    {tCommon('strategy_dialog.more_setting')}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground pb-2">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Thermometer className="h-4 w-4 text-muted-foreground" />
                                                <Label
                                                    className="font-medium">{tProject('model_dialog.temperature')}</Label>
                                            </div>
                                            <span
                                                className="font-medium  text-primary">{strategy.temperature}</span>
                                        </div>
                                        <div className="px-1">
                                            <Slider
                                                value={[strategy.temperature ?? 0.7]}
                                                onValueChange={value => handleChange('temperature', value[0] ?? 1)}
                                                min={0}
                                                max={2}
                                                step={0.1}
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
                                                <Label
                                                    className="font-medium "> {tProject('model_dialog.max_token')}</Label>
                                            </div>
                                            <span
                                                className="font-medium text-lg text-primary">{strategy.maxTokens}</span>
                                        </div>
                                        <div className="px-1">
                                            <Slider
                                                value={[strategy.maxTokens]}
                                                onValueChange={value => handleChange('maxTokens', value[0] ?? 1024)}
                                                min={1024}
                                                max={32768}
                                                step={1024}
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
                </DialogHeader>
                <DialogFooter className="border-t px-6 py-4 sm:items-center">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            {tCommon('cancel_btn')}
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button type="button" onClick={handleGenerateQuestion}>
                            {tCommon('confirm_btn')}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
