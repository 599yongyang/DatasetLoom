import { useGenerateCommon } from '@/hooks/generate/use-generate-common';
import { GenerateItem, StrategyParamsType } from '@/types/generate';

export function useGenerateDataset() {
    const { generateSingle, generateMultiple } = useGenerateCommon();

    const generateSingleDataset = async ({
                                             projectId,
                                             item,
                                             datasetStrategyParams
                                         }: {
        projectId: string;
        item: GenerateItem;
        datasetStrategyParams: StrategyParamsType;
    }) => {
        return generateSingle({
            projectId,
            item,
            strategyParams: datasetStrategyParams,
            endpoint: 'qa-dataset/create',
            descriptionType: 'answer'
        });
    };

    const generateMultipleDataset = async (
        projectId: string,
        items: GenerateItem[],
        datasetStrategyParams: StrategyParamsType
    ) => {
        return generateMultiple({
            projectId,
            items,
            strategyParams: datasetStrategyParams,
            endpoint: 'qa-dataset/create',
            descriptionType: 'answer'
        });
    };

    return {
        generateSingleDataset,
        generateMultipleDataset
    };
}
