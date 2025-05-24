import { toast } from 'sonner';
import axios, { type CancelTokenSource } from 'axios';
import { i18n } from '@/i18n';
import { isEmptyObject } from '@/lib/utils';
import type { QuestionStrategyParams } from '@/types/question';

export type SelectedChunk = {
    id: string;
    name: string;
};

// 封装通用的请求处理逻辑
async function baseGenerateQuestion(url: string, data: any, cancelSource: CancelTokenSource, chunkName: string) {
    const loadingToastId = toast.loading('问题生成中...', {
        description: `文本块：【${chunkName}】`,
        position: 'top-right',
        action: {
            label: '取消',
            onClick: () => {
                cancelSource.cancel('用户取消了操作');
                toast.dismiss(loadingToastId);
                toast.info('已取消生成问题', { position: 'top-right' });
            }
        }
    });

    try {
        const response = await axios.post(url, data, {
            cancelToken: cancelSource.token
        });

        toast.success('生成问题成功', { id: loadingToastId });
        return response.data;
    } catch (error) {
        if (axios.isCancel(error)) {
            toast.info('已取消生成问题', { id: loadingToastId, position: 'top-right' });
        } else {
            const message = error instanceof Error ? error.message : '生成问题失败';
            toast.error(message, { id: loadingToastId, position: 'top-right' });
        }
        throw error;
    }
}

export function useGenerateQuestion() {
    const generateSingleQuestion = async ({
        projectId,
        chunkId,
        chunkName,
        questionStrategy
    }: {
        projectId: string;
        chunkId: string;
        chunkName: string;
        questionStrategy: QuestionStrategyParams;
    }) => {
        if (!questionStrategy.modelConfigId) {
            toast.error('请选择模型');
            return;
        }

        const source = axios.CancelToken.source();

        // 添加语言配置
        questionStrategy.language = i18n.language;

        const url = `/api/project/${projectId}/chunks/${chunkId}/questions`;
        const data = { questionStrategy };

        return baseGenerateQuestion(url, data, source, chunkName);
    };

    const generateMultipleQuestion = async (
        projectId: string,
        chunks: SelectedChunk[],
        questionStrategy: QuestionStrategyParams
    ) => {
        const total = chunks.length;
        let completed = 0;

        const sources: CancelTokenSource[] = [];
        questionStrategy.language = i18n.language;

        const loadingToastId = toast.loading(`正在处理请求 (${completed}/${total})...`, {
            position: 'top-right',
            action: {
                label: '取消全部',
                onClick: () => {
                    sources.forEach(source => source.cancel('用户取消了操作'));
                    toast.dismiss(loadingToastId);
                    toast.info('已取消所有生成请求', { position: 'top-right' });
                }
            }
        });

        const updateLoadingToast = () => {
            toast.loading(`正在处理请求 (${completed}/${total})...`, { id: loadingToastId });
        };

        const processRequest = async (chunk: SelectedChunk) => {
            const source = axios.CancelToken.source();
            sources.push(source);

            try {
                const response = await baseGenerateQuestion(
                    `/api/project/${projectId}/chunks/${chunk.id}/questions`,
                    { questionStrategy },
                    source,
                    chunk.name
                );

                completed++;
                updateLoadingToast();
                toast.success(`${chunk.name} 完成`, { position: 'top-right' });
                return response;
            } catch (error) {
                completed++;
                updateLoadingToast();
                return Promise.reject(error);
            }
        };

        try {
            const results = await Promise.allSettled(chunks.map(processRequest));
            const fulfilled = results.filter(r => r.status === 'fulfilled').length;
            toast.success(`全部请求处理完成 (成功: ${fulfilled}/${total})`, {
                id: loadingToastId,
                position: 'top-right'
            });
            return results;
        } finally {
            sources.length = 0; // 清理取消令牌
        }
    };

    return {
        generateSingleQuestion,
        generateMultipleQuestion
    };
}
