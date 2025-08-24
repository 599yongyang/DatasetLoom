'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '../ui/input';
import PasswordInput from '@/components/ui/password-input';
import { type RemoteRepositoryData, uploadToHuggingFace } from '@/lib/utils/hugging-face';
import { ContextTypeMap, type DatasetExportType } from '@/constants/data-dictionary';
import { ContextType } from '@repo/shared-types';
import { txtExampleData } from '@/constants/export-example/text';
import { imageExampleData } from '@/constants/export-example/image';
import apiClient from '@/lib/axios';
import { downloadDataset } from '@/lib/utils';

export function ExportDataDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { projectId } = useParams();
    const [fileFormat, setFileFormat] = useState('sharegpt');
    const [dataType, setDataType] = useState('raw');
    const [onlyExportConfirmed, setOnlyExportConfirmed] = useState(false);
    const [includeCOT, setIncludeCOT] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [exportType, setExportType] = useState<DatasetExportType>('LOCAL_GENERAL');
    const [contextType, setContextType] = useState(ContextType.TEXT);
    const [example, setExample] = useState(txtExampleData[dataType][fileFormat]);
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
        if (contextType !== ContextType.TEXT) {
            setFileFormat('sharegpt');
        }
    }, [contextType]);

    useEffect(() => {
        setExample(
            contextType === ContextType.TEXT
                ? txtExampleData[dataType][fileFormat]
                : imageExampleData[dataType][fileFormat]
        );
    }, [fileFormat, dataType, contextType]);

    // 导出数据集
    const handleExportDatasets = () => {
        if (exportType === 'HF') {
            void handleUploadHF();
        } else {
            void exportDatasetsLocal();
        }
    };

    // 导出数据集到本地
    const exportDatasetsLocal = async () => {
        try {
            setIsExporting(true);
            await downloadDataset({
                url: `/${projectId}/qa-dataset/export`,
                params: {
                    contextType,
                    fileFormat,
                    dataType,
                    confirmedOnly: onlyExportConfirmed,
                    includeCOT,
                    exportType
                }
            });
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
            const res = await apiClient.post(`/${projectId}/qa-dataset/export`, {
                contextType,
                fileFormat,
                dataType,
                confirmedOnly: onlyExportConfirmed,
                includeCOT,
                exportType
            });
            if (res.data) {
                await uploadToHuggingFace({
                    remoteRepositoryData,
                    data: res.data,
                    fileFormat,
                    projectId: projectId as string,
                    dataType
                });
                onOpenChange(false);
            } else {
                toast.warning('暂无可上传的数据集');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[800px]">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b  px-6 py-4 text-base">导出数据集</DialogTitle>
                    <div className="px-6 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
                        <div className={'flex flex-row gap-4'}>
                            <div className={'basis-1/2 space-y-1 '}>
                                <Label>数据分类</Label>
                                <Select
                                    value={contextType}
                                    onValueChange={value => setContextType(value as ContextType)}
                                >
                                    <SelectTrigger className={'w-full'}>
                                        <SelectValue placeholder="Select Repository Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(ContextTypeMap).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className={'basis-1/2 space-y-1'}>
                                <Label>数据类型</Label>
                                <Select value={dataType} onValueChange={value => setDataType(value)}>
                                    <SelectTrigger className=" w-full">
                                        <SelectValue placeholder="Choose a plan" />
                                    </SelectTrigger>
                                    <SelectContent
                                        className=" [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                                        <SelectItem value="raw">
                                            全部数据
                                            <span className="text-muted-foreground block text-xs"
                                                  data-desc={'包含所有原始QA对（含重复问题和不同答案）'}>
                                                包含所有原始QA对（含重复问题和不同答案）
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="sft">
                                            SFT 数据
                                            <span className="text-muted-foreground  block text-xs"
                                                  data-desc={'每个问题仅保留主答案，适用于监督微调'}>
                                                每个问题仅保留主答案，适用于监督微调
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="dpo">
                                            DPO数据
                                            <span className="text-muted-foreground block text-xs"
                                                  data-desc={'包含偏好对比对（chosen/rejected answers）'}>
                                                包含偏好对比对（chosen/rejected answers）
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Label>导出目标</Label>
                        <Select value={exportType} onValueChange={value => setExportType(value as DatasetExportType)}>
                            <SelectTrigger className={'w-full'}>
                                <SelectValue placeholder="Select Repository Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'LOCAL_GENERAL'}>下载到本地</SelectItem>
                                <SelectItem value={'LLAMA_FACTORY'}>适配 LLaMA-Factory 使用</SelectItem>
                                <SelectItem value={'HF'}>上传到 Hugging Face 仓库</SelectItem>
                            </SelectContent>
                        </Select>
                        {exportType === 'HF' && (
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
                            {dataType !== 'dpo' && contextType === ContextType.TEXT && (
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

                        <Label>导出格式</Label>
                        <RadioGroup value={fileFormat} onValueChange={setFileFormat} className="flex gap-6">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sharegpt" id="sharegpt" />
                                <Label htmlFor="sharegpt">Sharegpt</Label>
                            </div>
                            <div
                                className="flex items-center space-x-2 has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50">
                                <RadioGroupItem
                                    value="alpaca"
                                    id="alpaca"
                                    disabled={contextType !== ContextType.TEXT}
                                />
                                <Label htmlFor="alpaca">Alpaca</Label>
                            </div>
                        </RadioGroup>
                        <Card className="bg-muted/50 p-4 rounded-md">
                            <pre className="text-sm whitespace-pre overflow-y-auto max-w-[700px]">{example}</pre>
                        </Card>
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
