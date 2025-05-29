import { BetweenVerticalStart, Brain, Hash, ListFilter, Palette, Thermometer, Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { difficultyMap, styleMap } from '@/constants/prompt';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModelSelect } from '@/components/model-select';
import type { QuestionStrategyParams } from '@/types/question';

export function QuestionStrategyForm({
    type,
    questionStrategy,
    setQuestionStrategy
}: {
    type: 'chunk' | 'workflow';
    questionStrategy: QuestionStrategyParams;
    setQuestionStrategy: React.Dispatch<React.SetStateAction<QuestionStrategyParams>>;
}) {
    const { t } = useTranslation('project');

    const handleChange = (field: keyof QuestionStrategyParams, value: string | number) => {
        setQuestionStrategy(prev => ({
            ...prev,
            [field]: value
        }));
    };
    return (
        <div className="space-y-4 pt-2">
            {type === 'workflow' && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-muted-foreground" />
                        <Label className="font-medium text-base">模型选择</Label>
                    </div>
                    <RadioGroup
                        className="flex flex-wrap gap-2"
                        value={questionStrategy.type}
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
            )}
            {questionStrategy.type === 'custom' && (
                <div className="px-1">
                    <ModelSelect type={'workflow-question'} />
                </div>
            )}
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
                    <Label className="font-medium ">问题风格</Label>
                </div>
                <Select value={questionStrategy.genre} onValueChange={value => handleChange('genre', value)}>
                    <SelectTrigger className={'w-45'}>
                        <SelectValue />
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
                <Select value={questionStrategy.difficulty} onValueChange={value => handleChange('difficulty', value)}>
                    <SelectTrigger className={'w-45'}>
                        <SelectValue />
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
                                    <Label className="font-medium">{t('model_dialog.temperature')}</Label>
                                </div>
                                <span className="font-medium  text-primary">{questionStrategy.temperature}</span>
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
                                    <Label className="font-medium "> {t('model_dialog.max_token')}</Label>
                                </div>
                                <span className="font-medium text-lg text-primary">{questionStrategy.maxTokens}</span>
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
