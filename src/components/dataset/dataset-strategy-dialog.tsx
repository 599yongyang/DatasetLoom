import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Hash, Palette, Quote, Thermometer, Wand } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Select, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SelectContent } from '@/components/ui/select';
import { answerStyleMap, detailRuleMap } from '@/constants/prompt';
import { useAtomValue } from 'jotai';
import { selectedModelInfoAtom } from '@/atoms';
import { useGenerateDataset } from '@/hooks/use-generate-dataset';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Questions } from '@prisma/client';

export function DatasetStrategyDialog({
    type,
    open,
    setOpen,
    questions,
    mutateQuestions
}: {
    type: 'single' | 'multiple';
    open: boolean;
    setOpen: (open: boolean) => void;
    questions: Questions[];
    mutateQuestions: () => void;
}) {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('project');

    const model = useAtomValue(selectedModelInfoAtom);
    const { generateSingleDataset, generateMultipleDataset } = useGenerateDataset();
    console.log(model);
    const [datasetStrategy, setDatasetStrategy] = useState({
        detailLevel: 'concise',
        answerStyle: 'direct',
        citation: '0',
        temperature: model.temperature,
        maxTokens: model.maxTokens
    });

    const handleChange = (field: string, value: string | number) => {
        setDatasetStrategy(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerateDataset = async () => {
        if (type === 'single') {
            if (questions && questions[0])
                await generateSingleDataset({
                    projectId,
                    questionId: questions[0].id,
                    questionInfo: questions[0].question,
                    datasetStrategyParams: datasetStrategy
                });
        } else {
            await generateMultipleDataset(projectId, questions, datasetStrategy);
        }
        mutateQuestions();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">数据集生成配置</DialogTitle>
                    <div className="flex flex-col gap-4 overflow-y-auto p-4 text-sm">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Palette className="h-4 w-4 text-muted-foreground" />
                                    <Label className="font-medium ">答案风格</Label>
                                </div>
                                <Select
                                    value={datasetStrategy.answerStyle}
                                    onValueChange={value => handleChange('answerStyle', value)}
                                >
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
                                    <Label className="font-medium ">答案详细程度</Label>
                                </div>
                                <Select
                                    value={datasetStrategy.detailLevel}
                                    onValueChange={value => handleChange('detailLevel', value)}
                                >
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
                                    <Label className="font-medium ">记录引用</Label>
                                </div>
                                <RadioGroup
                                    className="flex flex-wrap gap-2"
                                    value={datasetStrategy.citation}
                                    onValueChange={value => handleChange('citation', value)}
                                >
                                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none">
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value={'1'} className="after:absolute after:inset-0" />
                                            <Label>是</Label>
                                        </div>
                                    </div>
                                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none">
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value={'0'} className="after:absolute after:inset-0" />
                                            <Label>否</Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value={'more'} className="py-2">
                                    <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
                                        更多设置
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground pb-2">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                                                    <Label className="font-medium">
                                                        {t('model_dialog.temperature')}
                                                    </Label>
                                                </div>
                                                <span className="font-medium  text-primary">
                                                    {datasetStrategy.temperature}
                                                </span>
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
                                                    <Label className="font-medium ">
                                                        {' '}
                                                        {t('model_dialog.max_token')}
                                                    </Label>
                                                </div>
                                                <span className="font-medium text-lg text-primary">
                                                    {datasetStrategy.maxTokens}
                                                </span>
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
                                                    <span>32K</span>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </DialogHeader>
                <DialogFooter className="border-t px-6 py-4 sm:items-center">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            取消
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button type="button" onClick={handleGenerateDataset}>
                            生成
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
