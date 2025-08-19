import { Injectable } from '@nestjs/common';
import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import { ModelConfigWithProvider } from '@/common/prisma/type';
import { BaseAIProvider } from '@/common/ai/providers/base-ai-provider';

@Injectable()
export class OpenAIProvider extends BaseAIProvider {
    private openai;

    constructor(config: ModelConfigWithProvider) {
        super(config);
        this.openai = createOpenAI({
            baseURL: config.provider.apiUrl ?? 'https://api.openai.com/v1',
            apiKey: config.provider.apiKey ?? ''
        });
    }

    protected getModel(): LanguageModel {
        if (!this.config.modelId) {
            throw new Error('Model ID is required');
        }
        return this.openai(this.config.modelId);
    }

    protected getEmbedModel() {
        if (!this.config.modelId) {
            throw new Error('Model ID is required');
        }
        return this.openai.embedding(this.config.modelId);
    }
}
