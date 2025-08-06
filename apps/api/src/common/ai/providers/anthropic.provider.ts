import {Injectable} from '@nestjs/common';
import type {LanguageModel} from 'ai';
import {ModelConfigWithProvider} from '@/common/prisma/type';
import {CryptoUtil} from "@/utils/crypto.util";
import {createAnthropic} from "@ai-sdk/anthropic";
import {BaseAIProvider} from "@/common/ai/providers/base-ai-provider";

@Injectable()
export class AnthropicProvider extends BaseAIProvider {
    private anthropic;

    constructor(config: ModelConfigWithProvider) {
        super(config);
        this.anthropic = createAnthropic({
            baseURL: config.provider.apiUrl ?? 'https://api.anthropic.com/v1', // 默认API 地址
            apiKey: config.provider.apiKey ? CryptoUtil.decrypt(config.provider.apiKey) : ''
        });
    }

    protected getModel(): LanguageModel {
        if (!this.config.modelId) {
            throw new Error('Model ID is required');
        }
        return this.anthropic(this.config.modelId);
    }
}
