import {Injectable} from '@nestjs/common';
import type {LanguageModel} from 'ai';
import {ModelConfigWithProvider} from '@/common/prisma/type';
import {createOllama} from 'ollama-ai-provider';
import {BaseAIProvider} from "@/common/ai/providers/base-ai-provider";

@Injectable()
export class OllamaProvider extends BaseAIProvider {
    private ollama;

    constructor(config: ModelConfigWithProvider) {
        super(config);
        this.ollama = createOllama({
            baseURL: config.provider.apiUrl ?? 'http://localhost:11434' // 默认本地地址
        });
    }

    protected getModel(): LanguageModel {
        if (!this.config.modelId) {
            throw new Error('Model ID is required');
        }
        return this.ollama(this.config.modelId);
    }
}
