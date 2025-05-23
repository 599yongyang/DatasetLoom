import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BetweenVerticalStart, FileQuestion, Hash, ListFilter, Palette, Thermometer, Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
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
import { difficultyMap, styleMap } from '@/constants/prompt';
import { useAtomValue } from 'jotai';
import { selectedModelInfoAtom } from '@/atoms';
import { type SelectedChunk, useGenerateQuestion } from '@/hooks/use-generate-question';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function QuestionStrategyDialog({
    type,
    open,
    setOpen,
    chunks,
    mutateChunks
}: {
    type: 'single' | 'multiple';
    open: boolean;
    setOpen: (open: boolean) => void;
    chunks: SelectedChunk[];
    mutateChunks: () => void;
}) {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('project');

    const model = useAtomValue(selectedModelInfoAtom);
    const { generateSingleQuestion, generateMultipleQuestion } = useGenerateQuestion();

    console.log(model);
    const [questionStrategy, setQuestionStrategy] = useState({
        questionCountType: 'auto',
        questionCount: 10,
        difficulty: 'medium',
        genre: 'neutral',
        audience: '大众',
        temperature: model.temperature,
        maxTokens: model.maxTokens
    });

    const handleChange = (field: string, value: string | number) => {
        setQuestionStrategy(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerateQuestion = async () => {
        if (type === 'single') {
            if (chunks && chunks[0]) {
                await generateSingleQuestion({
                    projectId,
                    chunkId: chunks[0].id,
                    chunkName: chunks[0].name,
                    questionStrategy
                });
            } else {
                return;
            }
        } else {
            await generateMultipleQuestion(projectId, chunks, questionStrategy);
        }
        mutateChunks();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">问题生成配置</DialogTitle>
                    <div className="flex flex-col gap-4 overflow-y-auto p-4 text-sm">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BetweenVerticalStart className="h-4 w-4 text-muted-foreground" />
                                    <Label className="font-medium ">每块生成问题数</Label>
                                </div>
                                <RadioGroup
                                    className="flex flex-wrap gap-2"
                                    value={questionStrategy.questionCountType}
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
                            {questionStrategy.questionCountType === 'custom' && (
                                <div className="px-1">
                                    <Input
                                        type="number"
                                        placeholder="请输入问题数量"
                                        value={questionStrategy.questionCount}
                                        onChange={e => handleChange('questionCount', e.target.value)}
                                    />
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Palette className="h-4 w-4 text-muted-foreground" />
                                    <Label className="font-medium ">风格</Label>
                                </div>
                                <Select
                                    value={questionStrategy.genre}
                                    onValueChange={value => handleChange('genre', value)}
                                >
                                    <SelectTrigger className={'w-45'}>
                                        <SelectValue placeholder="Select framework" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(styleMap).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ListFilter className="h-4 w-4 text-muted-foreground" />
                                    <Label className="font-medium ">难度级别</Label>
                                </div>
                                <Select
                                    value={questionStrategy.difficulty}
                                    onValueChange={value => handleChange('difficulty', value)}
                                >
                                    <SelectTrigger className={'w-45'}>
                                        <SelectValue placeholder="Select framework" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(difficultyMap).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value.depth}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <Label className="font-medium ">受众人群</Label>
                                </div>
                                <Input
                                    className={'w-45'}
                                    value={questionStrategy.audience}
                                    onChange={e => handleChange('audience', e.target.value)}
                                />
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
                                                    {questionStrategy.temperature}
                                                </span>
                                            </div>
                                            <div className="px-1">
                                                <Slider
                                                    value={[questionStrategy.temperature ?? 0.7]}
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
                                                    {questionStrategy.maxTokens}
                                                </span>
                                            </div>
                                            <div className="px-1">
                                                <Slider
                                                    value={[questionStrategy.maxTokens]}
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
                        <Button type="button" onClick={handleGenerateQuestion}>
                            生成
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
