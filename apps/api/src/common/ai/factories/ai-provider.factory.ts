import {
    Injectable
} from '@nestjs/common';
import {OpenAIProvider} from '../providers/openai.provider';
import {ModelConfigWithProvider} from '@/common/prisma/type';
import {IAIProvider, IAIProviderFactory} from '../interfaces/ai-provider.interface';
import {BaseAIProvider} from "@/common/ai/providers/base-ai-provider";
import {ChatService} from "@/chat/chat.service";
import {AnthropicProvider} from "@/common/ai/providers/anthropic.provider";
import {GoogleProvider} from "@/common/ai/providers/google.provider";
import {DeepseekProvider} from "@/common/ai/providers/deepseek.provider";
import {OllamaProvider} from "@/common/ai/providers/ollama.provider";
import {OpenRouterProvider} from "@/common/ai/providers/openrouter.provider";
import {ZhipuProvider} from "@/common/ai/providers/zhipu.provider";
import {OpenaiCompatibleProvider} from '../providers/openai-compatible.provider';
import {ModelUsageService} from "@/model-usage/model-usage.service";


type ProviderConstructor = new (config: ModelConfigWithProvider) => BaseAIProvider;

@Injectable()
export class AIProviderFactory implements IAIProviderFactory {
    private providerMap: Record<string, ProviderConstructor> = {
        anthropic: AnthropicProvider,
        deepseek: DeepseekProvider,
        google: GoogleProvider,
        ollama: OllamaProvider,
        openai: OpenAIProvider,
        openrouter: OpenRouterProvider,
        zhipu: ZhipuProvider
    };

    constructor(private readonly chatService: ChatService, private readonly modelUsageService: ModelUsageService) {
    }

    create(config: ModelConfigWithProvider): IAIProvider {
        const providerType = config.provider?.interfaceType?.toLowerCase() || 'openAICompatible';
        const ProviderClass = this.providerMap[providerType] || OpenaiCompatibleProvider;

        const provider = new ProviderClass(config);

        // 设置依赖服务
        provider.setChatService(this.chatService);
        provider.setModelUsageService(this.modelUsageService);

        return provider;
    }

    registerProvider(type: string, providerClass: ProviderConstructor) {
        this.providerMap[type.toLowerCase()] = providerClass;
    }
}
