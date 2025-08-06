import {Injectable, Logger} from '@nestjs/common';
import type {UIMessage, CoreUserMessage, Message} from 'ai';
import {ModelConfigWithProvider} from '@/common/prisma/type';
import {IAIProvider} from "@/common/ai/interfaces/ai-provider.interface";
import {AIProviderFactory} from "@/common/ai/factories/ai-provider.factory";


@Injectable()
export class AIService {
    private readonly logger = new Logger(AIService.name);
    private providerCache = new Map<string, IAIProvider>();

    constructor(private readonly aiProviderFactory: AIProviderFactory) {
    }

    private getProvider(config: ModelConfigWithProvider): IAIProvider {
        const cacheKey = `${config.provider.interfaceType}-${config.id}`;

        if (!this.providerCache.has(cacheKey)) {
            const provider = this.aiProviderFactory.create(config);
            this.providerCache.set(cacheKey, provider);
            this.logger.debug(`Created new AI provider: ${cacheKey}`);
        }

        return this.providerCache.get(cacheKey)!;
    }

    async chat(
        config: ModelConfigWithProvider,
        prompt: string | UIMessage[] | CoreUserMessage[],
        options?: any
    ) {
        const provider = this.getProvider(config);
        const messages = Array.isArray(prompt)
            ? prompt
            : [{role: 'user', content: prompt}] as UIMessage[];

        return await provider.chat(messages, options);
    }

    async vision(
        config: ModelConfigWithProvider,
        image: string | Uint8Array | ArrayBuffer | Buffer,
        prompt: string
    ) {
        const provider = this.getProvider(config);
        return await provider.vision(image, prompt);
    }

    chatStream(
        config: ModelConfigWithProvider,
        messages: UIMessage[],
        chatId: string,
        userMessage: UIMessage,
        options?: any
    ) {
        const provider = this.getProvider(config);
        return provider.chatStream(messages, chatId, userMessage, options);
    }


    async generateTitle(config: ModelConfigWithProvider, message: Message): Promise<string> {
        const provider = this.getProvider(config);
        return await provider.generateTitle(message);
    }

    clearCache() {
        this.providerCache.clear();
        this.logger.debug('AI provider cache cleared');
    }
}
