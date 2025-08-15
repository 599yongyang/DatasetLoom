import { toast } from 'sonner';
import apiClient from '@/lib/axios';
import { baseRequestHandler, batchRequestHandler } from '@/hooks/generate/use-batch-requests';
import { GenerateItem, StrategyParamsType } from '@/types/generate';

export function useGenerateCommon() {
    const generateSingle = async ({
                                      projectId,
                                      item,
                                      strategyParams,
                                      endpoint,
                                      descriptionType
                                  }: {
        projectId: string;
        item: GenerateItem;
        strategyParams: StrategyParamsType;
        endpoint: string;
        descriptionType: 'question' | 'answer';
    }) => {
        if (!strategyParams.modelConfigId) {
            toast.error('请选择模型');
            return;
        }

        const source = apiClient.createCancelToken();

        return baseRequestHandler({
            url: `/${projectId}/${endpoint}`,
            data: { itemId: item.id, ...strategyParams },
            cancelSource: source,
            description: item.name,
            descriptionType
        });
    };

    const generateMultiple = async ({
                                        projectId,
                                        items,
                                        strategyParams,
                                        endpoint,
                                        descriptionType
                                    }: {
        projectId: string;
        items: GenerateItem[];
        strategyParams: StrategyParamsType;
        endpoint: string;
        descriptionType: 'question' | 'answer';
    }) => {
        return batchRequestHandler({
            items,
            processItem: async (item, source) => {
                if (!strategyParams.modelConfigId) {
                    throw new Error('请选择模型');
                }
                return baseRequestHandler({
                    url: `/${projectId}/${endpoint}`,
                    data: { itemId: item.id, ...strategyParams },
                    cancelSource: source,
                    description: item.name,
                    descriptionType
                });
            },
            itemName: (item) => item.name,
            actionDescription: '请求'
        });
    };

    return {
        generateSingle,
        generateMultiple
    };
}
