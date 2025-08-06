import {Injectable} from '@nestjs/common';
import type {LanguageModel} from 'ai';
import {ModelConfigWithProvider} from '@/common/prisma/type';
import {CryptoUtil} from "@/utils/crypto.util";
import {createDeepSeek} from "@ai-sdk/deepseek";
import {BaseAIProvider} from "@/common/ai/providers/base-ai-provider";

@Injectable()
export class DeepseekProvider extends BaseAIProvider {
    private deepseek;

    constructor(config: ModelConfigWithProvider) {
        super(config);
        this.deepseek = createDeepSeek({
            baseURL: config.provider.apiUrl ?? 'https://api.deepseek.com/v1', // 默认API 地址
            apiKey: config.provider.apiKey ? CryptoUtil.decrypt(config.provider.apiKey) : ''
        });
    }

    protected getModel(): LanguageModel {
        if (!this.config.modelId) {
            throw new Error('Model ID is required');
        }
        return this.deepseek(this.config.modelId);
    }
}
