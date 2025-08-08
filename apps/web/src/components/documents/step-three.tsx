import {Alert, AlertDescription} from '@/components/ui/alert';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {useParams} from 'next/navigation';
import React, {useEffect, useRef, useState} from 'react';

import {Loader2, XCircle, CheckCircle} from 'lucide-react';
import {chunkConfigHashAtom} from '@/atoms';
import type {Chunks} from '@/types/interfaces';
import {Markdown} from '@/components/chat/markdown';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {useSetAtom} from 'jotai';
import type {UploadFormDataType} from '@/app/(dashboard)/project/[projectId]/knowledge/document/upload/page';
import apiClient from "@/lib/axios";

type ParsingStatus = 'idle' | 'parsing' | 'chunking' | 'done' | 'error';

export default function StepThree({uploadFormData}: { uploadFormData: UploadFormDataType }) {
    const {projectId} = useParams();

    const [showStyle, setShowStyle] = useState('md');
    const [status, setStatus] = useState<ParsingStatus>('idle');
    const [chunkData, setChunkData] = useState<Chunks[]>([]);
    const [error, setError] = useState<string | null>(null);
    const setChunkConfigHash = useSetAtom(chunkConfigHashAtom);
    const hasProcessed = useRef(false);
    useEffect(() => {
        if (!hasProcessed.current) {
            hasProcessed.current = true;
            handleProcess();
        }
    }, []);

    const handleProcess = async () => {
        try {
            setStatus('parsing');
            const formData = new FormData();

            uploadFormData.selectedFiles.forEach(file => {
                formData.append('localFiles', file);
            });
            formData.append('sourceType', uploadFormData.sourceType);
            formData.append('selectedService', uploadFormData.selectedService);
            formData.append('webFileUrls', JSON.stringify(uploadFormData.webFileUrls));
            formData.append('webUrls', JSON.stringify(uploadFormData.webUrls));

            //解析文档
            const parseRes = await apiClient.post(`/${projectId}/document/parser`, formData);

            if (!parseRes.data.data) throw new Error('文档解析失败');

            // 开始分块
            setStatus('chunking');

            const chunkRes = await apiClient.post(`/${projectId}/documentChunk/create`, {
                ...uploadFormData,
                fileIds: parseRes.data.data
            });
            if (!chunkRes.data.data) throw new Error('文档分块失败');

            // 成功处理
            setStatus('done');
            const {chunkList, hash} = chunkRes.data.data;
            setChunkData(chunkList || []);
            setChunkConfigHash(hash);
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setError(err.message || '解析或分块过程中发生错误，请重试');
        }
    };

    // 渲染状态提示
    const renderStatusMessage = () => {
        switch (status) {
            case 'parsing':
                return (
                    <Alert className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-yellow-500"/>
                        <AlertDescription>正在解析你的文档...</AlertDescription>
                    </Alert>
                );
            case 'chunking':
                return (
                    <Alert className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500"/>
                        <AlertDescription>正在进行智能分块处理...</AlertDescription>
                    </Alert>
                );
            case 'error':
                return (
                    <Alert variant="destructive" className="flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-red-600"/>
                        <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                );
            default:
                return null;
        }
    };
    return (
        <div className="space-y-6">
            {/* 状态提示 */}
            {status !== 'done' && renderStatusMessage()}

            {/* 分块结果展示 */}
            {status === 'done' && (
                <>
                    <div className={'flex justify-between items-center'}>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500"/>
                            解析完成 共{chunkData.length}个分块
                        </div>
                        <div className="inline-flex items-center gap-2">
                            <div className="text-sm text-muted-foreground">展示样式</div>
                            <RadioGroup
                                value={showStyle}
                                onValueChange={setShowStyle}
                                className="grid grid-cols-2 gap-2"
                            >
                                <label
                                    className="border-input has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-col items-center gap-3 rounded-md border px-2 py-3 text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50">
                                    <RadioGroupItem value="md" className="sr-only after:absolute after:inset-0"/>
                                    <p className="text-foreground text-sm leading-none font-medium">Markdown</p>
                                </label>
                                <label
                                    className="border-input has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-col items-center gap-3 rounded-md border px-2 py-3 text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50">
                                    <RadioGroupItem value="text" className="sr-only after:absolute after:inset-0"/>
                                    <p className="text-foreground text-sm leading-none font-medium">Text</p>
                                </label>
                            </RadioGroup>
                        </div>
                    </div>

                    {chunkData.map((chunk, index) => (
                        <div key={index} className="p-4 border rounded-md bg-white shadow-sm">
                            <div className={'flex justify-between items-center'}>
                                <Badge variant="outline" className="mb-2">
                                    {chunk.name}
                                </Badge>
                                <div className="text-xs text-gray-500">{chunk.content.length} characters</div>
                            </div>
                            <div className="whitespace-pre-wrap text-sm text-gray-800 mt-2">
                                {showStyle === 'md' ? <Markdown>{chunk.content}</Markdown> : <>{chunk.content}</>}
                            </div>
                        </div>
                    ))}
                </>
            )}

            {/* 错误时显示重试按钮 */}
            {status === 'error' && (
                <div className="mt-4">
                    <Button variant="outline" onClick={handleProcess}>
                        🔁 重试
                    </Button>
                </div>
            )}
        </div>
    );
}
