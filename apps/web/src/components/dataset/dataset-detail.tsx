'use client';

import {useEffect, useState} from 'react';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs';
import {Accordion, AccordionItem, AccordionTrigger, AccordionContent} from '@/components/ui/accordion';
import {Badge} from '@/components/ui/badge';
import {Star, Tag, Brain, Quote, FileText, Atom} from 'lucide-react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../ui/table';
import type {DatasetSamples, PreferencePair} from '@/types/interfaces';
import {AIScoreDashboard} from '@/components/dataset/ai-score-chart';
import {ContextType} from '@repo/shared-types';
import AnswerCard from '@/components/dataset/answer-card';
import {BACKEND_URL} from "@/constants/config";
import { Response } from '@/components/ai-elements/response';

export default function DatasetDetail({
                                          questionInfo,
                                          dssId,
                                          refresh
                                      }: {
    questionInfo: any;
    dssId: string;
    refresh: () => void;
}) {
    const {
        DatasetSamples: datasetSamples,
        PreferencePair: pp
    }: {
        DatasetSamples: DatasetSamples[];
        PreferencePair: PreferencePair;
    } = questionInfo;
    if (!datasetSamples[0]) return null;
    const [activeAnswerId, setActiveAnswerId] = useState(dssId);
    const [activeAnswer, setActiveAnswer] = useState<DatasetSamples>(datasetSamples[0]);


    useEffect(() => {
        setActiveAnswerId(dssId);
    }, [dssId]);

    useEffect(() => {
        if (!datasetSamples || datasetSamples.length === 0) return;
        const foundAnswer = datasetSamples.find(d => d.id === activeAnswerId) || datasetSamples[0];
        if (foundAnswer) setActiveAnswer(foundAnswer);
    }, [activeAnswerId, datasetSamples]);

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
                                    {dss.isPrimaryAnswer && <Star className="w-3 h-3 text-black "/>}
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
                        <AnswerCard count={1} refresh={refresh} activeAnswer={activeAnswer as DatasetSamples} pp={pp}/>
                    </div>
                )}
            </div>

            <Accordion type="multiple" defaultValue={['ai-score', 'cot', 'label', 'evidence']} className="w-full">
                {/*AI 评分*/}
                <AccordionItem value={'ai-score'} className="py-2">
                    <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
                        <div className="flex items-center gap-3">
                            <Atom className="w-5 h-5 text-sky-600"/>
                            <span>大模型回答质量评估</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <AIScoreDashboard dssId={activeAnswer?.id} contextType={questionInfo.contextType}/>
                    </AccordionContent>
                </AccordionItem>
                {questionInfo.contextType === ContextType.TEXT && (
                    <>
                        {/*思维链*/}
                        <AccordionItem value={'cot'} className="py-2">
                            <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <Brain className="w-5 h-5 text-indigo-600"/>
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
                                    <Tag className="w-5 h-5 text-blue-600"/>
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
                    </>
                )}

                {/*引用内容*/}
                <AccordionItem value={'evidence'} className="py-2">
                    <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
                        <div className="flex items-center gap-3">
                            <Quote className="h-4 w-4"/>
                            <span>引用内容</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground ps-7 pb-2">
                        <Table>
                            <TableHeader className="bg-transparent">
                                <TableRow
                                    className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
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

                {/*引用内容*/}
                <AccordionItem value={'4'} className="py-2">
                    <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-teal-600"/>
                            <span>引用内容</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground ps-7 pb-2">
                        {questionInfo.contextType === ContextType.TEXT && questionInfo.contextData && (
                            <Response>{questionInfo.contextData}</Response>
                        )}
                        {questionInfo.contextType === ContextType.IMAGE && questionInfo.contextId && (
                            <img
                                src={`${BACKEND_URL}${JSON.parse(questionInfo.contextData).imageUrl}`}
                                alt={questionInfo.contextName}
                                className="w-full h-full object-contain"
                            />
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    );
}
