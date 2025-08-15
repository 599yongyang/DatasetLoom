export interface StrategyParamsType {
    modelName: string;
    modelConfigId: string;
    temperature: number;
    maxTokens: number;
    templateId: string;
    variablesData: Record<string, any>;
}

export const defaultStrategyConfig: StrategyParamsType = {
    modelName: '',
    modelConfigId: '',
    temperature: 0.7,
    maxTokens: 8192,
    templateId: '',
    variablesData: {}
};

export interface GenerateItem {
    id: string;
    name: string;
}
