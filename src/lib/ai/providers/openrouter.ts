import { createOpenRouter, type OpenRouterProvider } from '@openrouter/ai-sdk-provider';
import type { LanguageModel } from 'ai';
import { BaseClient } from './base';
import type { ModelConfigWithProvider } from '@/lib/ai/core/types';

/**
 * OpenRouter 客户端类
 * 继承自 BaseClient，用于与 OpenRouter 提供商交互
 */
class OpenRouterClient extends BaseClient {
    openrouter: OpenRouterProvider;

    /**
     * 构造函数
     * @param config - 配置信息
     */
    constructor(config: ModelConfigWithProvider) {
        super(config);

        // 初始化 OpenRouter 实例
        this.openrouter = createOpenRouter({
            baseURL: config.provider.apiUrl ?? 'https://api.openrouter.ai', // 默认 OpenRouter API 地址
            apiKey: config.provider.apiKey ?? '' // 确保 apiKey 必须提供
        });
    }

    /**
     * 实现抽象方法 _getModel
     * 返回指定模型的语言模型实例
     */
    protected _getModel(): LanguageModel {
        return this.openrouter(this.config.modelId);
    }
}

export default OpenRouterClient;
