import type { ModelConfigWithProvider } from '@/lib/ai/core/types';
import ZhiPuClient from '@/lib/ai/providers/zhipu';
import AnthropicClient from '@/lib/ai/providers/anthropic';
import type { BaseClient } from '@/lib/ai/providers/base';
import OllamaClient from '@/lib/ai/providers/ollama';
import OpenAIClient from '@/lib/ai/providers/openai';
import OpenRouterClient from '@/lib/ai/providers/openrouter';
import OpenAICompatibleClient from '@/lib/ai/providers/openai-compatible';
import DeepSeekClient from '@/lib/ai/providers/deepseek';
import GoogleClient from '@/lib/ai/providers/google';

type ClientMap = {
    [key: string]: new (config: ModelConfigWithProvider) => BaseClient;
};

const clientMap: ClientMap = {
    openai: OpenAIClient,
    ollama: OllamaClient,
    zhipu: ZhiPuClient,
    anthropic: AnthropicClient,
    openrouter: OpenRouterClient,
    deepseek: DeepSeekClient,
    google: GoogleClient
};
const DefaultClient = OpenAICompatibleClient;

export function createLLMClient(providerType: string, config: ModelConfigWithProvider): BaseClient {
    const normalizedType = providerType.toLowerCase();
    const ClientClass = clientMap[normalizedType] || DefaultClient;

    return new ClientClass(config);
}
