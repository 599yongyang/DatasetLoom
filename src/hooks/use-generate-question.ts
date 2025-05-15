import { useCallback } from 'react';
import { toast } from 'sonner';
import axios, { type CancelTokenSource } from 'axios';
import { useAtomValue } from 'jotai';
import { selectedModelInfoAtom } from '@/atoms';
import { i18n } from '@/i18n';
import { isEmptyObject } from '@/lib/utils';

type SelectedChunk = {
    id: string;
    name: string;
};

export function useGenerateQuestion() {
    const model = useAtomValue(selectedModelInfoAtom);

    const generateSingleQuestion = useCallback(
        async ({ projectId, chunkId, chunkName }: { projectId: string; chunkId: string; chunkName: string }) => {
            if (isEmptyObject(model) || model.id === null) {
                toast.error('请选择模型');
                return;
            }
            // 创建取消令牌源
            const source = axios.CancelToken.source();

            // 显示带取消按钮的loading
            const loadingToastId = toast.loading('问题生成中...', {
                description: `文本块：【${chunkName}】`,
                position: 'top-right',
                action: {
                    label: '取消',
                    onClick: () => {
                        source.cancel('用户取消了操作');
                        toast.dismiss(loadingToastId);
                        toast.info('已取消生成问题', { position: 'top-right' });
                    }
                }
            });

            try {
                const response = await axios.post(
                    `/api/project/${projectId}/chunks/${chunkId}/questions`,
                    {
                        model,
                        language: i18n.language
                    },
                    {
                        cancelToken: source.token
                    }
                );

                toast.success('生成问题成功', { id: loadingToastId });
                return response.data;
            } catch (error) {
                if (axios.isCancel(error)) {
                    // 已处理取消逻辑，不需要额外操作
                } else {
                    toast.error(error instanceof Error ? error.message : '生成问题失败', { id: loadingToastId });
                }
                return null;
            }
        },
        [model]
    );

    const generateMultipleQuestion = useCallback(
        async (projectId: string, chunks: SelectedChunk[]) => {
            let completed = 0;
            const total = chunks.length;

            // 存储所有请求的取消令牌
            const sources: CancelTokenSource[] = [];

            // 显示带取消按钮的Loading
            const loadingToastId = toast.loading(`正在处理请求 (${completed}/${total})...`, {
                position: 'top-right',
                action: {
                    label: '取消全部',
                    onClick: () => {
                        // 取消所有请求
                        sources.forEach(source => source.cancel('用户取消了操作'));
                        toast.dismiss(loadingToastId);
                        toast.info('已取消所有生成请求', { position: 'top-right' });
                    }
                }
            });

            // 处理每个请求
            const processRequest = async (chunk: SelectedChunk) => {
                const source = axios.CancelToken.source();
                sources.push(source);

                try {
                    const response = await axios.post(
                        `/api/project/${projectId}/chunks/${chunk.id}/questions`,
                        {
                            model,
                            language: i18n.language
                        },
                        {
                            cancelToken: source.token
                        }
                    );

                    completed++;
                    toast.success(`${chunk.name} 完成`, { position: 'top-right' });
                    toast.loading(`正在处理请求 (${completed}/${total})...`, { id: loadingToastId });
                    return response.data;
                } catch (error) {
                    completed++;
                    if (axios.isCancel(error)) {
                        toast.info(`${chunk.name} 已取消`, { position: 'top-right' });
                    } else {
                        toast.error(`${chunk.name} 失败`, {
                            description: error instanceof Error ? error.message : '未知错误',
                            position: 'top-right'
                        });
                    }
                    toast.loading(`正在处理请求 (${completed}/${total})...`, { id: loadingToastId });
                    throw error;
                }
            };

            try {
                const results = await Promise.allSettled(chunks.map(req => processRequest(req)));
                // 全部完成后更新Loading为完成状态
                toast.success(
                    `全部请求处理完成 (成功: ${results.filter(r => r.status === 'fulfilled').length}/${total})`,
                    {
                        id: loadingToastId,
                        position: 'top-right'
                    }
                );
                return results;
            } catch {
                // Promise.allSettled不会进入catch，这里只是保险
            }
        },
        [model]
    );

    return { generateSingleQuestion, generateMultipleQuestion };
}
