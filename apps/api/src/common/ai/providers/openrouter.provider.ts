import {Injectable} from '@nestjs/common';
import {createOpenRouter} from '@openrouter/ai-sdk-provider';
import type {LanguageModel} from 'ai';
import {ModelConfigWithProvider} from '@/common/prisma/type';
import {CryptoUtil} from "@/utils/crypto.util";
import {BaseAIProvider} from "@/common/ai/providers/base-ai-provider";

@Injectable()
export class OpenRouterProvider extends BaseAIProvider {
    private openrouter;

    constructor(config: ModelConfigWithProvider) {
        super(config);
        this.openrouter = createOpenRouter({
            baseURL: config.provider.apiUrl ?? 'https://api.openrouter.ai',
            apiKey: config.provider.apiKey ? CryptoUtil.decrypt(config.provider.apiKey) : ''
        });
    }

    protected getModel(): LanguageModel {
        if (!this.config.modelId) {
            throw new Error('Model ID is required');
        }
        return this.openrouter(this.config.modelId);
    }
}
