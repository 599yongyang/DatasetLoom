import type { ModelConfigWithProvider } from '@/lib/llm/core/types';
import ZhiPuClient from '@/lib/llm/providers/zhipu';
import AnthropicClient from '@/lib/llm/providers/anthropic';
import type { BaseClient } from '@/lib/llm/providers/base';
import OllamaClient from '@/lib/llm/providers/ollama';
import OpenAIClient from '@/lib/llm/providers/openai';
import OpenRouterClient from '@/lib/llm/providers/openrouter';
import OpenAICompatibleClient from '@/lib/llm/providers/openai-compatible';
import DeepSeekClient from '@/lib/llm/providers/deepseek';
import GoogleClient from '@/lib/llm/providers/google';

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
