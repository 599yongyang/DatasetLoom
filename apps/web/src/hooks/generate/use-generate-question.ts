import { useGenerateCommon } from '@/hooks/generate/use-generate-common';
import { GenerateItem, StrategyParamsType } from '@/types/generate';

export function useGenerateQuestion() {
    const { generateSingle, generateMultiple } = useGenerateCommon();

    const generateSingleQuestion = async ({
                                              projectId,
                                              item,
                                              questionStrategy
                                          }: {
        projectId: string;
        item: GenerateItem;
        questionStrategy: StrategyParamsType;
    }) => {
        return generateSingle({
            projectId,
            item,
            strategyParams: questionStrategy,
            endpoint: 'documentChunk/gen-question',
            descriptionType: 'question'
        });
    };

    const generateMultipleQuestion = async (
        projectId: string,
        chunks: GenerateItem[],
        questionStrategy: StrategyParamsType
    ) => {
        return generateMultiple({
            projectId,
            items: chunks,
            strategyParams: questionStrategy,
            endpoint: 'documentChunk/gen-question',
            descriptionType: 'question'
        });
    };

    return {
        generateSingleQuestion,
        generateMultipleQuestion
    };
}
