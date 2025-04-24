import { useCallback } from 'react';
import { toast } from 'sonner';
import axios, { type CancelTokenSource } from 'axios';
import { useAtomValue } from 'jotai/index';
import { i18n } from '@/i18n';
import { selectedModelInfoAtom } from '@/atoms';
import type { Questions } from '@prisma/client';
import { useTranslation } from 'react-i18next';

export function useGenerateDataset() {
    const model = useAtomValue(selectedModelInfoAtom);
    const { t } = useTranslation('question');
    const generateSingleDataset = useCallback(
        async ({
            projectId,
            questionId,
            questionInfo
        }: {
            projectId: string;
            questionId: string;
            questionInfo: string;
        }) => {
            if (!model) {
                toast.error('没有找到模型');
                return null;
            }

            // 创建取消令牌源
            const source = axios.CancelToken.source();

            // 显示带取消按钮的loading
            const loadingToastId = toast.loading(t('toast.gen_ing'), {
                description: `问题：【${questionInfo}】`,
                position: 'top-right',
                action: {
                    label: '取消',
                    onClick: () => {
                        source.cancel('用户取消了操作');
                        toast.dismiss(loadingToastId);
                        toast.info('已取消数据集生成', { position: 'top-right' });
                    }
                }
            });

            try {
                const response = await axios.post(
                    `/api/project/${projectId}/datasets`,
                    {
                        questionId,
                        model,
                        language: i18n.language
                    },
                    {
                        cancelToken: source.token
                    }
                );

                toast.success('生成数据集成功', { id: loadingToastId });
                return response.data;
            } catch (error) {
                if (axios.isCancel(error)) {
                    // 已处理取消逻辑，不需要额外操作
                } else {
                    toast.error(error instanceof Error ? error.message : '生成数据集失败', { id: loadingToastId });
                }
                return null;
            }
        },
        [model]
    );

    const generateMultipleDataset = useCallback(
        async (projectId: string, questions: Questions[]) => {
            let completed = 0;
            const total = questions.length;

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
                        toast.info('已取消所有数据集生成请求', { position: 'top-right' });
                    }
                }
            });

            // 处理每个请求
            const processRequest = async (question: Questions) => {
                const source = axios.CancelToken.source();
                sources.push(source);

                try {
                    const response = await axios.post(
                        `/api/project/${projectId}/datasets`,
                        {
                            questionId: question.id,
                            model,
                            language: i18n.language
                        },
                        {
                            cancelToken: source.token
                        }
                    );

                    completed++;
                    toast.success(`${question.question} 完成`, { position: 'top-right' });
                    toast.loading(`正在处理请求 (${completed}/${total})...`, { id: loadingToastId });
                    return response.data;
                } catch (error) {
                    completed++;
                    if (axios.isCancel(error)) {
                        toast.info(`${question.question} 已取消`, { position: 'top-right' });
                    } else {
                        toast.error(`${question.question} 失败`, {
                            description: error instanceof Error ? error.message : '未知错误',
                            position: 'top-right'
                        });
                    }
                    toast.loading(`正在处理请求 (${completed}/${total})...`, { id: loadingToastId });
                    throw error;
                }
            };

            try {
                const results = await Promise.allSettled(questions.map(req => processRequest(req)));
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

    return { generateSingleDataset, generateMultipleDataset };
}
