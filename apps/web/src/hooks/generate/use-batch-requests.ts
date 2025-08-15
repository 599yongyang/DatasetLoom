import { toast } from 'sonner';
import axios, { type CancelTokenSource } from 'axios';
import apiClient from '@/lib/axios';
import { GenerateItem } from '@/types/generate';

interface BaseRequestConfig {
    url: string;
    data: any;
    cancelSource: CancelTokenSource;
    description: string;
    descriptionType: 'question' | 'answer';
}

// 封装通用的请求处理逻辑
export async function baseRequestHandler(
    config: BaseRequestConfig
) {
    const { url, data, cancelSource, description, descriptionType } = config;

    const descriptionLabel = descriptionType === 'question' ? '引用分块' : '问题';

    const loadingToastId = toast.loading('生成中...', {
        description: `${descriptionLabel}：【${description}】`,
        position: 'top-right',
        action: {
            label: '取消',
            onClick: () => {
                cancelSource.cancel('用户取消了操作');
                toast.dismiss(loadingToastId);
                toast.info(`已取消生成`, { position: 'top-right' });
            }
        }
    });

    try {
        const response = await apiClient.post(url, data, {
            cancelToken: cancelSource.token
        });

        toast.success('生成成功', { id: loadingToastId });
        return response.data;
    } catch (error) {
        if (axios.isCancel(error)) {
            toast.info(`已取消生成`, {
                id: loadingToastId,
                position: 'top-right'
            });
        } else {
            const message = error instanceof Error ? error.message : '生成失败';
            toast.error(message, { id: loadingToastId, position: 'top-right' });
        }
        throw error;
    }
}

interface BatchRequestConfig {
    items: GenerateItem[];
    processItem: (item: GenerateItem, source: CancelTokenSource) => Promise<any>;
    itemName: (item: GenerateItem) => string;
    actionDescription: string;
}

export async function batchRequestHandler(config: BatchRequestConfig) {
    const { items, processItem, itemName, actionDescription } = config;

    const total = items.length;
    let completed = 0;

    const sources: CancelTokenSource[] = [];

    const loadingToastId = toast.loading(`正在处理${actionDescription} (${completed}/${total})...`, {
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
        toast.loading(`正在处理${actionDescription} (${completed}/${total})...`, { id: loadingToastId });
    };

    const processRequest = async (item: GenerateItem) => {
        const source = apiClient.createCancelToken();
        sources.push(source);

        try {
            const response = await processItem(item, source);

            completed++;
            updateLoadingToast();
            toast.success(`${itemName(item)} 完成`, { position: 'top-right' });
            return response;
        } catch (error) {
            completed++;
            updateLoadingToast();
            return Promise.reject(error);
        }
    };

    try {
        const results = await Promise.allSettled(items.map(processRequest));
        const fulfilledCount = results.filter(r => r.status === 'fulfilled').length;
        toast.success(`全部完成 (成功: ${fulfilledCount}/${total})`, {
            id: loadingToastId,
            position: 'top-right'
        });
        return results;
    } finally {
        sources.length = 0; // 清理取消令牌
    }
}
