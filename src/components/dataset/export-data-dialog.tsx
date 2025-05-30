'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { exampleData } from '@/constants/export-example';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '../ui/input';
import PasswordInput from '@/components/ui/password-input';
import { downloadFile, generateFileContent } from '@/lib/utils';
import { type RemoteRepositoryData, uploadToHuggingFace } from '@/lib/utils/hugging-face';

export function ExportDataDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { projectId } = useParams();
    const [fileFormat, setFileFormat] = useState('json');
    const [dataType, setDataType] = useState('raw');
    const [onlyExportConfirmed, setOnlyExportConfirmed] = useState(false);
    const [includeCOT, setIncludeCOT] = useState(true);
    const [example, setExample] = useState(exampleData[dataType][fileFormat]);
    const [isExporting, setIsExporting] = useState(false);
    const [exportType, setExportType] = useState('local');

    const [remoteRepositoryData, setRemoteRepositoryData] = useState<RemoteRepositoryData>({
        token: '',
        repositoryName: ''
    });

    const handleChange = (field: string, value: string) => {
        setRemoteRepositoryData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    useEffect(() => {
        setExample(exampleData[dataType][fileFormat]);
    }, [fileFormat, dataType]);

    // 导出数据集
    const handleExportDatasets = () => {
        if (exportType === 'huggingface') {
            void handleUploadHF();
        } else {
            void exportDatasetsLocal();
        }
    };

    // 导出数据集到本地
    const exportDatasetsLocal = async () => {
        setIsExporting(true);
        try {
            const data = await getExportData();
            const { content, extension } = generateFileContent(data, fileFormat);
            // 下载文件
            const fileName = `datasets-${projectId}-${dataType}-${new Date().getTime()}`;
            downloadFile(content, fileName, extension);
            onOpenChange(false);
            toast.success('数据集导出成功');
            if (exportType === 'llama-factory') {
                let config = {};
                if (dataType === 'dpo') {
                    config = {
                        [`Dataset_Loom_${projectId}`]: {
                            file_name: `${fileName}.${extension}`,
                            columns: {
                                messages: 'prompt',
                                chosen: 'chosen',
                                rejected: 'rejected'
                            }
                        }
                    };
                } else {
                    config = {
                        [`Dataset_Loom_${projectId}`]: {
                            file_name: `${fileName}.${extension}`
                        }
                    };
                }
                const content = JSON.stringify(config, null, 2);
                toast('dataset_info.json 配置', {
                    action: {
                        label: '复制配置',
                        onClick: () => {
                            navigator.clipboard
                                .writeText(content)
                                .then(() => {
                                    toast.success('已复制到剪贴板');
                                })
                                .catch(() => {
                                    toast.error('复制失败，请手动复制');
                                });
                        }
                    },
                    duration: 5000
                });
            }
        } catch (error) {
            console.error(error);
            toast.error('数据集导出失败');
        } finally {
            setIsExporting(false);
        }
    };

    //  上传数据集到 Hugging Face
    const handleUploadHF = async () => {
        setIsExporting(true);
        try {
            if (!remoteRepositoryData.token || !remoteRepositoryData.repositoryName) {
                toast.error('请填写Hugging Face仓库信息');
                return;
            }
            const data = await getExportData();
            await uploadToHuggingFace({
                remoteRepositoryData,
                data,
                fileFormat,
                projectId: projectId as string,
                dataType
            });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    // 获取导出数据
    const getExportData = async () => {
        const res = await axios.post(`/api/project/${projectId}/datasets/export`, {
            dataType,
            confirmedOnly: onlyExportConfirmed,
            includeCOT
        });
        if (res.status !== 200) {
            throw new Error('数据获取失败');
        }
        return res.data;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[800px]">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b  px-6 py-4 text-base">导出数据集</DialogTitle>
                    <div className="px-6 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
                        <Label>数据类型</Label>
                        <Select value={dataType} onValueChange={value => setDataType(value)}>
                            <SelectTrigger className=" w-full">
                                <SelectValue placeholder="Choose a plan" />
                            </SelectTrigger>
                            <SelectContent className=" [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                                <SelectItem value="raw">
                                    全部数据
                                    <span className="text-muted-foreground block text-xs" data-desc>
                                        包含所有原始QA对（含重复问题和不同答案）
                                    </span>
                                </SelectItem>
                                <SelectItem value="sft">
                                    SFT 数据
                                    <span className="text-muted-foreground  block text-xs" data-desc>
                                        每个问题仅保留主答案，适用于监督微调
                                    </span>
                                </SelectItem>
                                <SelectItem value="dpo">
                                    DPO数据
                                    <span className="text-muted-foreground block text-xs" data-desc>
                                        包含偏好对比对（chosen/rejected answers）
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Label>导出格式</Label>
                        <RadioGroup value={fileFormat} onValueChange={setFileFormat} className="flex gap-6">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="json" id="json" />
                                <Label htmlFor="json">JSON</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="jsonl" id="jsonl" />
                                <Label htmlFor="jsonl">JSONL</Label>
                                <span className="ml-1 text-xs">(推荐)</span>
                            </div>
                        </RadioGroup>

                        <Card className="bg-muted/50 p-4 rounded-md">
                            <pre className="text-sm whitespace-pre overflow-y-auto max-w-[700px]">{example}</pre>
                        </Card>
                        <Label>导出目标</Label>
                        <Select value={exportType} onValueChange={value => setExportType(value)}>
                            <SelectTrigger className={'w-full'}>
                                <SelectValue placeholder="Select Repository Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'local'}>下载到本地（通用格式）</SelectItem>
                                <SelectItem value={'llama-factory'}>适配 LLaMA-Factory 使用</SelectItem>
                                <SelectItem value={'huggingface'}>上传到 Hugging Face 仓库</SelectItem>
                            </SelectContent>
                        </Select>
                        {exportType === 'huggingface' && (
                            <>
                                <div className="*:not-first:mt-2">
                                    <div className={'flex flex-1 justify-between'}>
                                        <Label>Access Token</Label>
                                        <p className="text-sm text-muted-foreground">
                                            <a
                                                href="https://huggingface.co/settings/tokens"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-600"
                                            >
                                                获取 Access Token
                                            </a>
                                        </p>
                                    </div>

                                    <PasswordInput
                                        value={remoteRepositoryData.token}
                                        onChange={value => handleChange('token', value)}
                                        placeholder="Hugging Face Access Token"
                                    />
                                </div>
                                <div className="*:not-first:mt-2">
                                    <Label>数据集仓库名称</Label>
                                    <Input
                                        value={remoteRepositoryData.repositoryName}
                                        onChange={e => handleChange('repositoryName', e.target.value)}
                                        placeholder="数据集名称"
                                        required
                                    />
                                </div>
                            </>
                        )}
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
                            {dataType !== 'dpo' && (
                                <div className="flex  items-center space-x-2">
                                    <Checkbox
                                        id="thought-chain"
                                        checked={includeCOT}
                                        onCheckedChange={checked => setIncludeCOT(checked as boolean)}
                                    />

                                    <label
                                        htmlFor="thought-chain"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        包含思维链
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogHeader>
                <DialogFooter className="border-t px-6 py-4 sm:items-center">
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
