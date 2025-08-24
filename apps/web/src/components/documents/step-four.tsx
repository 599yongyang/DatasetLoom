import React, { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { chunkConfigHashAtom } from '@/atoms';
import { toast } from 'sonner';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/axios';
import { DocumentScope } from '@repo/shared-types';

type ParsingStatus = 'idle' | 'processing' | 'done' | 'error';

export default function StepFour() {
    const { projectId } = useParams();
    const router = useRouter();
    const chunkConfigHash = useAtomValue(chunkConfigHashAtom);
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<ParsingStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const hasRun = useRef(false);
    useEffect(() => {
        // 检查是否已经执行过，或者缺少必要参数
        if (hasRun.current || !chunkConfigHash || !projectId) {
            return;
        }
        // 标记为已执行
        hasRun.current = true;

        // 执行请求逻辑
        const processChunks = async () => {
            setStatus('processing');
            setError(null);
            const url = `/${projectId}/${searchParams.get('scope') === DocumentScope.PRETRAIN ? 'pretrain' : 'documentChunk'}/save`;
            await apiClient.post(url, { chunkConfigHash }).then(res => {
                toast.success('分块成功');
                setStatus('done');
            }).catch(error => {
                if (error.statusCode === 207) {
                    toast.success('分块成功');
                    setStatus('done');
                    setError(error.message);
                } else {
                    const errorMessage = error.message ?? '分块过程中发生错误';
                    setError(errorMessage);
                    setStatus('error');
                    toast.error(errorMessage);
                    console.error('分块错误:', error);
                }
            });
        };

        void processChunks();
    }, [projectId, chunkConfigHash]);


    const handelView = () => {
        const url = `/project/${projectId}/${searchParams.get('scope') === DocumentScope.PRETRAIN ? 'dataset/pretrain' : 'knowledge/document'}`;
        router.push(url);
    };

    const renderStatus = () => {
        switch (status) {
            case 'processing':
                return (
                    <div className="flex flex-col items-center justify-center space-y-2 p-4">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <div className="text-lg font-medium">正在处理分块...</div>
                        <div className="text-sm text-gray-500">这可能需要一些时间，请稍候</div>
                    </div>
                );
            case 'done':
                return (
                    <div className="flex flex-col items-center justify-center space-y-2 p-4">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <div className="text-lg font-medium">分块处理完成</div>
                        {error ? (<div className="text-sm text-red-500">{error}</div>) : (
                            <div className="text-sm text-gray-500">文档已成功分块并存储</div>)}
                        <Button onClick={handelView}>
                            查看结果
                        </Button>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex flex-col items-center justify-center space-y-2 p-4">
                        <XCircle className="h-8 w-8 text-red-500" />
                        <div className="text-lg font-medium">分块处理失败</div>
                        <div className="text-sm text-red-500">{error}</div>
                        <Button
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-md   px-4 py-2 text-white  "
                        >
                            重试
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return <div className="flex min-h-[200px] items-center justify-center">{renderStatus()}</div>;
}
