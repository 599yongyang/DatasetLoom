export interface QuestionStrategyParams {
    type: 'default' | 'custom';
    modelName: string;
    modelConfigId: string;
    questionCountType: 'auto' | 'custom';
    questionCount: number;
    temperature: number;
    maxTokens: number;
    topP?: number;
    topK?: number;
    difficulty: string;
    genre: string;
    audience: string;
    language: string;
}

export const defaultQuestionsStrategyConfig: QuestionStrategyParams = {
    type: 'default',
    modelName: '',
    modelConfigId: '',
    questionCountType: 'auto',
    questionCount: 5,
    temperature: 0.7,
    maxTokens: 8192,
    difficulty: 'medium',
    genre: 'neutral',
    audience: '大众',
    language: 'zh'
};
