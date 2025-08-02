import React, { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { chunkConfigHashAtom, selectedModelInfoAtom } from '@/atoms';
import axios from 'axios';
import { i18n } from '@/i18n';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ParsingStatus = 'idle' | 'processing' | 'done' | 'error';

export default function StepFour() {
    const { projectId } = useParams();
    const router = useRouter();
    const chunkConfigHash = useAtomValue(chunkConfigHashAtom);
    const model = useAtomValue(selectedModelInfoAtom);
    const [status, setStatus] = useState<ParsingStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const abortController = new AbortController();

        const handleSubmit = async () => {
            if (!chunkConfigHash || !model?.id) {
                setError('缺少必要的配置信息');
                setStatus('error');
                return;
            }

            setStatus('processing');
            setError(null);

            try {
                const res = await axios.put(
                    `/api/project/${projectId}/documents/chunker`,
                    {
                        chunkConfigHash,
                        modelConfigId: model.id,
                        language: i18n.language
                    },
                    {
                        signal: abortController.signal
                    }
                );

                if (res.data.success) {
                    toast.success('分块成功');
                    setStatus('done');
                } else {
                    throw new Error(res.data.message || '分块失败');
                }
            } catch (err) {
                if (axios.isCancel(err)) {
                    return;
                }

                const errorMessage = '分块过程中发生错误';
                setError(errorMessage);
                setStatus('error');
                toast.error(errorMessage);
                console.error('分块错误:', err);
            }
        };

        handleSubmit();

        return () => {
            abortController.abort();
        };
    }, [projectId, chunkConfigHash, model]);

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
                        <div className="text-sm text-gray-500">文档已成功分块并存储</div>
                        <Button
                            onClick={() => {
                                router.push(`/project/${projectId}/chunk/document`);
                            }}
                        >
                            查看分块列表
                        </Button>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex flex-col items-center justify-center space-y-2 p-4">
                        <XCircle className="h-8 w-8 text-red-500" />
                        <div className="text-lg font-medium">分块处理失败</div>
                        <div className="text-sm text-red-500">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                        >
                            重试
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return <div className="flex min-h-[200px] items-center justify-center">{renderStatus()}</div>;
}
