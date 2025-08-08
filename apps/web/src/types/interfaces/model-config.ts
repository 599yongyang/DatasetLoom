export interface ModelConfig {
    id: string;
    providerId: string;
    modelId: string;
    modelName: string;
    type: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
    status: boolean;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
}
