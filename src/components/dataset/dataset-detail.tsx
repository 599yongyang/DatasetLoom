'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ThumbsUp, ThumbsDown, Tag, Brain, Quote, FileText, Atom } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Markdown } from '@/components/chat/markdown';
import { Textarea } from '@/components/ui/textarea';
import { ModelTag } from '@lobehub/icons';
import type { DatasetSamples, PreferencePair } from '@prisma/client';
import axios from 'axios';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { AIScoreDashboard } from '@/components/dataset/ai-score-chart';
import { useAtomValue } from 'jotai';
import { selectedModelInfoAtom } from '@/atoms';
import { ProjectRole } from '@/schema/types';
import { WithPermission } from '../common/permission-wrapper';
import { useParams } from 'next/navigation';

export default function DatasetDetail({
    datasetSamples,
    dssId,
    pp,
    refresh
}: {
    datasetSamples: DatasetSamples[];
    dssId: string;
    pp: PreferencePair;
    refresh: () => void;
}) {
    const model = useAtomValue(selectedModelInfoAtom);
    const { projectId }: { projectId: string } = useParams();
    const [activeAnswerId, setActiveAnswerId] = useState(dssId);
    const [activeAnswer, setActiveAnswer] = useState(datasetSamples[0]);
    const [isScoring, setIsScoring] = useState(false);
    useEffect(() => {
        setActiveAnswerId(dssId);
    }, [dssId]);

    useEffect(() => {
        if (!datasetSamples || datasetSamples.length === 0) return;
        const foundAnswer = datasetSamples.find(d => d.id === activeAnswerId) || datasetSamples[0];
        setActiveAnswer(foundAnswer);
    }, [activeAnswerId, datasetSamples]);

    const handleAIScore = () => {
        setIsScoring(true);
        toast.promise(
            axios.post(`/api/project/${activeAnswer?.projectId}/datasets/ai-score`, {
                dssId: activeAnswerId,
                modelId: model.id
            }),
            {
                loading: 'AI 正在进行评分中...',
                success: data => {
                    if (data.data.success) {
                        refresh();
                        return '处理成功';
                    } else {
                        return '处理失败';
                    }
                },
                error: error => {
                    console.error('处理失败:', error);
                    return '处理失败';
                },
                finally: () => {
                    setIsScoring(false);
                }
            }
        );
    };
    return (
        <>
            {/* 答案部分 */}
            <div className="mb-8">
                {datasetSamples.length > 1 ? (
                    <Tabs
                        value={activeAnswerId}
                        onValueChange={value => setActiveAnswerId(value)}
                        className="space-y-4 mt-3"
                    >
                        <TabsList className=" p-1 rounded-lg">
                            {datasetSamples.map((dss, index) => (
                                <TabsTrigger
                                    key={dss.id}
                                    value={dss.id.toString()}
                                    className="flex items-center gap-1 px-4 py-2 rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    答案 {String.fromCharCode(65 + index)}
                                    {dss.isPrimaryAnswer && <Star className="w-3 h-3 text-black " />}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <TabsContent value={activeAnswerId}>
                            <AnswerCard
                                count={datasetSamples.length}
                                refresh={refresh}
                                activeAnswer={activeAnswer as DatasetSamples}
                                pp={pp}
                            />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className={'mt-3'}>
                        <AnswerCard count={1} refresh={refresh} activeAnswer={activeAnswer as DatasetSamples} pp={pp} />
                    </div>
                )}
            </div>

            <Accordion type="multiple" defaultValue={['ai-score', 'cot', 'label', 'evidence']} className="w-full">
                {/*AI 评分*/}
                <AccordionItem value={'ai-score'} className="py-2">
                    <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
                        <div className="flex items-center gap-3">
                            <Atom className="w-5 h-5 text-sky-600" />
                            <span>大模型回答质量评估</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        {activeAnswer?.aiScoreModel ? (
                            <AIScoreDashboard dss={activeAnswer as DatasetSamples} handleAIScore={handleAIScore} />
                        ) : isScoring ? (
                            <div className="text-center py-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                                <p className="mt-2 text-sm text-muted-foreground">AI 正在评分中 ...</p>
                            </div>
                        ) : (
                            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center space-y-4">
                                <div className="flex justify-center">
                                    <Atom className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium">暂未进行 AI 评分</h3>
                                <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                                    <div className="text-sm text-muted-foreground max-w-md mx-auto space-y-1">
                                        <p>使用AI模型对当前答案进行自动质量评估</p>
                                        <p className="text-xs">
                                            建议: 使用不同于生成此答案的模型进行评估，以获得更客观结果
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAIScore}
                                        className="gap-1 px-4 py-2"
                                    >
                                        <Atom className="w-4 h-4" />
                                        生成 AI 评分
                                    </Button>
                                </WithPermission>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

                {/*思维链*/}
                <AccordionItem value={'cot'} className="py-2">
                    <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
                        <div className="flex items-center gap-3">
                            <Brain className="w-5 h-5 text-indigo-600" />
                            <span>思维链</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground ps-7 pb-2">
                        {activeAnswer?.cot || '无'}
                    </AccordionContent>
                </AccordionItem>

                {/*参考标签*/}
                <AccordionItem value={'label'} className="py-2">
                    <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
                        <div className="flex items-center gap-3">
                            <Tag className="w-5 h-5 text-blue-600" />
                            <span>参考标签</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground ps-7 pb-2">
                        <div className="flex flex-wrap gap-2">
                            {activeAnswer?.referenceLabel
                                .split(',')
                                .map((label, index) => <Badge key={index}>{label}</Badge>)}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/*引用内容*/}
                <AccordionItem value={'evidence'} className="py-2">
                    <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
                        <div className="flex items-center gap-3">
                            <Quote className="h-4 w-4" />
                            <span>引用内容</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground ps-7 pb-2">
                        <Table>
                            <TableHeader className="bg-transparent">
                                <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
                                    <TableHead>来源位置</TableHead>
                                    <TableHead>依据内容</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="[&_td:first-child]:rounded-l-lg [&_td:last-child]:rounded-r-lg">
                                {activeAnswer?.evidence &&
                                    JSON.parse(activeAnswer.evidence).map(
                                        (item: { location: string; text: string }, index: number) => (
                                            <TableRow
                                                key={item.location + index}
                                                className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r"
                                            >
                                                <TableCell>{item.location}</TableCell>
                                                <TableCell>{item.text}</TableCell>
                                            </TableRow>
                                        )
                                    )}
                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>

                {/*文本块*/}
                <AccordionItem value={'4'} className="py-2">
                    <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-teal-600" />
                            <span>文本块</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground ps-7 pb-2">
                        {activeAnswer?.chunkContent && <Markdown>{activeAnswer.chunkContent}</Markdown>}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    );
}

function AnswerCard({
    activeAnswer,
    pp,
    count,
    refresh
}: {
    activeAnswer: DatasetSamples;
    pp: PreferencePair;
    count: number;
    refresh: () => void;
}) {
    const getPreferenceBadge = (id: string) => {
        if (!pp) return null;
        if (id === pp.datasetChosenId) {
            return (
                <Badge className="bg-green-500 hover:bg-green-600">
                    <ThumbsUp className="w-3 h-3 mr-1" /> 偏好
                </Badge>
            );
        } else if (id === pp.datasetRejectId) {
            return (
                <Badge variant="destructive">
                    <ThumbsDown className="w-3 h-3 mr-1" /> 拒绝
                </Badge>
            );
        }
        return null;
    };

    const handlePP = async (type: 'chosen' | 'rejected') => {
        if (!activeAnswer) {
            toast.error('当前答案为空，无法操作');
            return;
        }

        const { projectId, questionId, question, id: answerId, answer } = activeAnswer;

        // 初始化 pp 对象
        const newPP = {
            id: pp?.id ?? nanoid(),
            projectId,
            questionId,
            prompt: question,
            chosen: pp?.chosen ?? '',
            rejected: pp?.rejected ?? '',
            datasetChosenId: pp?.datasetChosenId ?? '',
            datasetRejectId: pp?.datasetRejectId ?? ''
        } as PreferencePair;

        // 设置对应字段
        if (type === 'chosen') {
            newPP.chosen = answer;
            newPP.datasetChosenId = answerId;
        } else if (type === 'rejected') {
            newPP.rejected = answer;
            newPP.datasetRejectId = answerId;
        }

        try {
            await axios.post(`/api/project/${projectId}/preference-pair`, newPP);
            toast.success('设置成功');
            refresh();
        } catch (error) {
            console.error('设置失败:', error);
            toast.error('设置失败，请重试');
        }
    };

    const handlePrimaryAnswer = () => {
        axios
            .put(`/api/project/${activeAnswer.projectId}/datasets/primary-answer`, {
                dssId: activeAnswer.id,
                questionId: activeAnswer.questionId
            })
            .then(_ => {
                toast.success('设置成功');
                refresh();
            })
            .catch(error => {
                console.error('设置失败:', error);
                toast.error('设置失败');
            });
    };

    return (
        <div className="border rounded-lg shadow-sm  overflow-hidden">
            <div className="p-4 ">
                <Textarea value={activeAnswer.answer} readOnly className="w-full h-32 resize-none   focus:ring-0" />
            </div>
            <div className="flex flex-wrap justify-between items-center p-4 gap-2">
                <div className="flex flex-wrap gap-2">
                    {activeAnswer.isPrimaryAnswer && (
                        <Badge>
                            <Star className="w-3 h-3 mr-1" /> 主答案
                        </Badge>
                    )}
                    {getPreferenceBadge(activeAnswer.id)}
                    <ModelTag model={activeAnswer.model} type={'color'} />
                    <p className="text-gray-500 text-sm">置信度: {activeAnswer.confidence * 100}%</p>
                </div>
                <WithPermission required={ProjectRole.EDITOR} projectId={activeAnswer.projectId}>
                    <div className="flex gap-2 flex-wrap">
                        {count > 1 && !activeAnswer.isPrimaryAnswer && (
                            <Button variant="outline" size="sm" onClick={handlePrimaryAnswer} className="gap-1">
                                <Star className="w-4 h-4" /> 设置为主答案
                            </Button>
                        )}

                        {pp?.datasetChosenId !== activeAnswer.id && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePP('chosen')}
                                className="gap-1 text-green-700 border-green-300 hover:bg-green-50"
                            >
                                <ThumbsUp className="w-4 h-4" /> 标为偏好
                            </Button>
                        )}
                        {pp?.datasetRejectId !== activeAnswer.id && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePP('rejected')}
                                className="gap-1 text-red-700 border-red-300 hover:bg-red-50"
                            >
                                <ThumbsDown className="w-4 h-4" /> 标为拒绝
                            </Button>
                        )}
                    </div>
                </WithPermission>
            </div>
        </div>
    );
}
