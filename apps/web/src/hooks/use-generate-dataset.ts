import {toast} from 'sonner';
import axios, {type CancelTokenSource} from 'axios';
import {i18n} from '@/i18n';
import type {DatasetStrategyParams} from '@/types/dataset';
import type {Questions} from '@prisma/client';
import apiClient from "@/lib/axios";

// 封装通用的请求处理逻辑
async function baseGenerateDataset(url: string, data: any, cancelSource: CancelTokenSource, questionInfo: string) {
    const loadingToastId = toast.loading('生成中...', {
        description: `问题：【${questionInfo}】`,
        position: 'top-right',
        action: {
            label: '取消',
            onClick: () => {
                cancelSource.cancel('用户取消了操作');
                toast.dismiss(loadingToastId);
                toast.info('已取消生成', {position: 'top-right'});
            }
        }
    });

    try {
        const response = await apiClient.post(url, data, {
            cancelToken: cancelSource.token
        });

        toast.success('生成成功', {id: loadingToastId});
        return response.data;
    } catch (error) {
        if (axios.isCancel(error)) {
            toast.info('已取消生成', {id: loadingToastId, position: 'top-right'});
        } else {
            const message = error instanceof Error ? error.message : '生成失败';
            toast.error(message, {id: loadingToastId, position: 'top-right'});
        }
        throw error;
    }
}

export function useGenerateDataset() {
    const generateSingleDataset = async ({
                                             projectId,
                                             questionId,
                                             questionInfo,
                                             datasetStrategyParams
                                         }: {
        projectId: string;
        questionId: string;
        questionInfo: string;
        datasetStrategyParams: DatasetStrategyParams;
    }) => {
        if (!datasetStrategyParams.modelConfigId) {
            toast.error('没有找到模型');
            return null;
        }

        const source = apiClient.createCancelToken();
        datasetStrategyParams.language = i18n.language;

        const url = `/${projectId}/qa-dataset/create`;
        const data = {
            questionId,
            ...datasetStrategyParams
        };

        return baseGenerateDataset(url, data, source, questionInfo);
    };

    const generateMultipleDataset = async (
        projectId: string,
        questions: Questions[],
        datasetStrategyParams: DatasetStrategyParams
    ) => {
        const total = questions.length;
        let completed = 0;

        const sources: CancelTokenSource[] = [];
        datasetStrategyParams.language = i18n.language;

        const loadingToastId = toast.loading(`正在处理请求 (${completed}/${total})...`, {
            position: 'top-right',
            action: {
                label: '取消全部',
                onClick: () => {
                    sources.forEach(source => source.cancel('用户取消了操作'));
                    toast.dismiss(loadingToastId);
                    toast.info('已取消所有生成请求', {position: 'top-right'});
                }
            }
        });

        const updateLoadingToast = () => {
            toast.loading(`正在处理请求 (${completed}/${total})...`, {id: loadingToastId});
        };

        const processRequest = async (question: Questions) => {
            const source = apiClient.createCancelToken();
            sources.push(source);
            try {
                const response = await baseGenerateDataset(
                    `/${projectId}/qa-dataset/create`,
                    {
                        questionId: question.id,
                        ...datasetStrategyParams
                    },
                    source,
                    question.question
                );

                completed++;
                updateLoadingToast();
                toast.success(`${question.question} 完成`, {position: 'top-right'});
                return response;
            } catch (error) {
                completed++;
                updateLoadingToast();
                return Promise.reject(error);
            }
        };

        try {
            const results = await Promise.allSettled(questions.map(processRequest));
            const fulfilledCount = results.filter(r => r.status === 'fulfilled').length;
            toast.success(`全部完成 (成功: ${fulfilledCount}/${total})`, {
                id: loadingToastId,
                position: 'top-right'
            });
            return results;
        } finally {
            sources.length = 0; // 清理取消令牌
        }
    };

    return {
        generateSingleDataset,
        generateMultipleDataset
    };
}
