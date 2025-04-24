'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import type { Datasets } from '@prisma/client';
import { jsonExample, jsonlExample } from '@/constants/export-example';

export function ExportDataDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { projectId } = useParams();
    const [fileFormat, setFileFormat] = useState('json');
    const [datasetStyle, setDatasetStyle] = useState('alpaca');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [onlyExportConfirmed, setOnlyExportConfirmed] = useState(false);
    const [includeThoughtChain, setIncludeThoughtChain] = useState(true);
    const [example, setExample] = useState(JSON.stringify(jsonExample.alpaca, null, 2));
    const [isExporting, setIsExporting] = useState(false);
    const [tab, setTab] = useState('local');
    useEffect(() => {
        if (fileFormat === 'json') {
            setExample(JSON.stringify(jsonExample[datasetStyle], null, 2));
        } else {
            setExample(jsonlExample[datasetStyle]);
        }
    }, [fileFormat, datasetStyle]);

    // 导出数据集
    const handleExportDatasets = () => {
        if (tab === 'local') {
            exportDatasetsLocal();
        } else if (tab === 'llama-factory') {
            exportDatasetsLlamaFactory();
        }
    };

    const exportDatasetsLocal = async () => {
        setIsExporting(true);

        try {
            // 构建API URL
            const apiUrl = `/api/project/${projectId}/datasets/export${onlyExportConfirmed ? '?status=confirmed' : ''}`;

            // 获取数据
            const { data } = await axios.get<Datasets[]>(apiUrl);

            // 格式化数据
            const formattedData = formatExportData(data, datasetStyle, {
                systemPrompt,
                includeThoughtChain
            });

            // 生成文件内容
            const { content, extension } = generateFileContent(formattedData, fileFormat);

            // 下载文件
            downloadFile(content, extension, datasetStyle, projectId as string);

            toast.success('数据集导出成功');
            onOpenChange(false);
        } catch (error) {
            console.error('导出失败:', error);
            toast.error('数据集导出失败', {
                description: axios.isAxiosError(error) ? error.response?.data?.message || error.message : '请稍后再试'
            });
        } finally {
            setIsExporting(false);
        }
    };

    // 格式化导出数据
    const formatExportData = (
        data: Datasets[],
        style: string,
        options: {
            systemPrompt: string;
            includeThoughtChain: boolean;
        }
    ) => {
        return data.map(item => {
            const answer =
                options.includeThoughtChain && item.cot ? `<think>${item.cot}</think>\n${item.answer}` : item.answer;

            if (style === 'alpaca') {
                return {
                    instruction: item.question,
                    input: '',
                    output: answer,
                    system: options.systemPrompt || ''
                };
            } else {
                const messages = [];
                if (options.systemPrompt) {
                    messages.push({
                        role: 'system',
                        content: options.systemPrompt
                    });
                }
                messages.push({ role: 'user', content: item.question }, { role: 'assistant', content: answer });
                return { messages };
            }
        });
    };

    // 生成文件内容
    const generateFileContent = (data: any[], format: string) => {
        if (format === 'jsonl') {
            return {
                content: data.map(item => JSON.stringify(item)).join('\n'),
                extension: 'jsonl',
                mimeType: 'application/jsonl'
            };
        }
        return {
            content: JSON.stringify(data, null, 2),
            extension: 'json',
            mimeType: 'application/json'
        };
    };

    // 下载文件
    const downloadFile = (content: string, extension: string, style: string, projectId: string) => {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `datasets-${projectId}-${style}-${new Date().toISOString().slice(0, 10)}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportDatasetsLlamaFactory = async () => {
        try {
            setIsExporting(true);
            const response = await axios.post(
                `/api/project/${projectId}/llama-factory`,
                {
                    formatType: fileFormat,
                    systemPrompt,
                    confirmedOnly: onlyExportConfirmed,
                    includeCOT: includeThoughtChain
                },
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${projectId}-datasets-LlamaFactory.zip`); // 设置下载文件名
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : '未知错误');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] ">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">导出数据集</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="local" value={tab} className="w-full ">
                    <TabsList className="w-full grid grid-cols-3">
                        <TabsTrigger value="local" onClick={() => setTab('local')} className="text-sm">
                            导出到本地
                        </TabsTrigger>
                        <TabsTrigger value="llama-factory" onClick={() => setTab('llama-factory')} className="text-sm">
                            在 LLaMA Factory 中使用
                        </TabsTrigger>
                        <TabsTrigger
                            value="remote"
                            onClick={() => setTab('remote')}
                            disabled={true}
                            className="text-sm"
                        >
                            上传至远程仓库
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="local" className="mt-4   space-y-6  max-h-[70vh] overflow-y-auto ">
                        <div className="space-y-4 ">
                            <div>
                                <h3 className="text-base font-medium mb-3">文件格式</h3>
                                <RadioGroup value={fileFormat} onValueChange={setFileFormat} className="flex gap-6">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="json" id="json" />
                                        <Label htmlFor="json">JSON</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="jsonl" id="jsonl" />
                                        <Label htmlFor="jsonl">JSONL</Label>
                                    </div>
                                    {/*<div className="flex items-center space-x-2">*/}
                                    {/*    <RadioGroupItem value="csv" id="csv"/>*/}
                                    {/*    <Label htmlFor="csv">CSV</Label>*/}
                                    {/*</div>*/}
                                </RadioGroup>
                            </div>

                            <div>
                                <h3 className="text-base font-medium mb-3">数据集风格</h3>
                                <RadioGroup value={datasetStyle} onValueChange={setDatasetStyle} className="flex gap-6">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="alpaca" id="alpaca" />
                                        <Label htmlFor="alpaca">Alpaca</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="sharegpt" id="sharegpt" />
                                        <Label htmlFor="sharegpt">ShareGPT</Label>
                                    </div>
                                    {/*<div className="flex items-center space-x-2">*/}
                                    {/*    <RadioGroupItem value="custom" id="custom"/>*/}
                                    {/*    <Label htmlFor="custom">自定义格式</Label>*/}
                                    {/*</div>*/}
                                </RadioGroup>
                            </div>

                            <div>
                                <h3 className="text-base font-medium mb-3">格式示例</h3>
                                <Card className="bg-muted/50 p-4 rounded-md">
                                    <pre className="text-sm whitespace-pre overflow-y-auto max-w-[700px]">
                                        {example}
                                    </pre>
                                </Card>
                            </div>

                            <div>
                                <h3 className="text-base font-medium mb-3">系统提示词</h3>
                                <Textarea
                                    placeholder="请输入系统提示词..."
                                    value={systemPrompt}
                                    onChange={e => setSystemPrompt(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="flex flex-1 gap-3 pt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="confirmed"
                                        checked={onlyExportConfirmed}
                                        onCheckedChange={checked => setOnlyExportConfirmed(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="confirmed"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        仅导出已确认数据
                                    </label>
                                </div>
                                <div className="flex  items-center space-x-2">
                                    <Checkbox
                                        id="thought-chain"
                                        checked={includeThoughtChain}
                                        onCheckedChange={checked => setIncludeThoughtChain(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="thought-chain"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        包含思维链
                                    </label>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="llama-factory">
                        <div className="space-y-4 ">
                            <div>
                                <h3 className="text-base font-medium mb-3">系统提示词</h3>
                                <Textarea
                                    placeholder="请输入系统提示词..."
                                    value={systemPrompt}
                                    onChange={e => setSystemPrompt(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="flex flex-1 gap-3 pt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="confirmed"
                                        checked={onlyExportConfirmed}
                                        onCheckedChange={checked => setOnlyExportConfirmed(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="confirmed"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        仅导出已确认数据
                                    </label>
                                </div>
                                <div className="flex  items-center space-x-2">
                                    <Checkbox
                                        id="thought-chain"
                                        checked={includeThoughtChain}
                                        onCheckedChange={checked => setIncludeThoughtChain(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="thought-chain"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        包含思维链
                                    </label>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="remote">
                        <div className="py-6 text-center text-muted-foreground">远程仓库上传选项将在此显示</div>
                    </TabsContent>
                </Tabs>
                <DialogFooter className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        取消
                    </Button>
                    <Button onClick={handleExportDatasets} disabled={isExporting}>
                        {isExporting ? '导出中...' : '确认导出'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
