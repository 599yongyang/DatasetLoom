import { Injectable } from '@nestjs/common';
import type { LanguageModel } from 'ai';
import { ModelConfigWithProvider } from '@/common/prisma/type';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { BaseAIProvider } from '@/common/ai/providers/base-ai-provider';

@Injectable()
export class OpenaiCompatibleProvider extends BaseAIProvider {
    private openAICompatible;

    constructor(config: ModelConfigWithProvider) {
        super(config);
        this.openAICompatible = createOpenAICompatible({
            baseURL: config.provider.apiUrl ?? 'https://api.example.com/v1', // 默认API 地址
            name: 'openAICompatible',
            apiKey: config.provider.apiKey ?? ''
        });
    }

    protected getModel(): LanguageModel {
        if (!this.config.modelId) {
            throw new Error('Model ID is required');
        }
        return this.openAICompatible(this.config.modelId);
    }

    protected getEmbedModel() {
        if (!this.config.modelId) {
            throw new Error('Embedding model ID is required');
        }
        return this.openAICompatible.textEmbeddingModel(this.config.modelId);
    }
}
