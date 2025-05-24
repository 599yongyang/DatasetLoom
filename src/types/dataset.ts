export interface DatasetStrategyParams {
    type: 'default' | 'custom';
    modelName: string;
    modelConfigId?: string;
    temperature: number;
    maxTokens: number;
    topP?: number;
    topK?: number;
    detailLevel: string;
    answerStyle: string;
    citation: boolean;
    language: string;
}

export const defaultDatasetStrategyConfig: DatasetStrategyParams = {
    type: 'default',
    modelName: 'gpt-3.5-turbo',
    modelConfigId: '',
    temperature: 0.7,
    maxTokens: 8192,
    detailLevel: 'concise',
    answerStyle: 'direct',
    citation: true,
    language: 'zh'
};
