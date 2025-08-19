import { Injectable } from '@nestjs/common';
import type { LanguageModel } from 'ai';
import { ModelConfigWithProvider } from '@/common/prisma/type';
import { CryptoUtil } from '@/utils/crypto.util';
import { createZhipu } from 'zhipu-ai-provider';
import { BaseAIProvider } from '@/common/ai/providers/base-ai-provider';

@Injectable()
export class ZhipuProvider extends BaseAIProvider {
    private zhipu;

    constructor(config: ModelConfigWithProvider) {
        super(config);
        this.zhipu = createZhipu({
            baseURL: config.provider.apiUrl ?? 'https://api.zhipu.ai', // 默认智谱AI API 地址
            apiKey: config.provider.apiKey ? CryptoUtil.decrypt(config.provider.apiKey) : ''
        });
    }

    protected getModel(): LanguageModel {
        if (!this.config.modelId) {
            throw new Error('Model ID is required');
        }
        return this.zhipu(this.config.modelId);
    }

    protected getEmbedModel() {
        if (!this.config.modelId) {
            throw new Error('Model ID is required');
        }
        return this.zhipu.textEmbeddingModel(this.config.modelId);
    }
}
