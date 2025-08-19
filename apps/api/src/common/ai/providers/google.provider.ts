import { Injectable } from '@nestjs/common';
import type { LanguageModel } from 'ai';
import { ModelConfigWithProvider } from '@/common/prisma/type';
import { CryptoUtil } from '@/utils/crypto.util';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { BaseAIProvider } from '@/common/ai/providers/base-ai-provider';

@Injectable()
export class GoogleProvider extends BaseAIProvider {
    private google;

    constructor(config: ModelConfigWithProvider) {
        super(config);
        this.google = createGoogleGenerativeAI({
            baseURL: config.provider.apiUrl ?? 'https://generativelanguage.googleapis.com/v1beta', // 默认API 地址
            apiKey: config.provider.apiKey ? CryptoUtil.decrypt(config.provider.apiKey) : ''
        });
    }

    protected getModel(): LanguageModel {
        if (!this.config.modelId) {
            throw new Error('Model ID is required');
        }
        return this.google(this.config.modelId);
    }

    protected getEmbedModel() {
        if (!this.config.modelId) {
            throw new Error('Model ID is required');
        }
        return this.google.embedding(this.config.modelId);
    }
}
