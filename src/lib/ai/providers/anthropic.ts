import { createAnthropic, type AnthropicProvider } from '@ai-sdk/anthropic';
import type { LanguageModel } from 'ai';
import { BaseClient } from './base';
import type { ModelConfigWithProvider } from '@/lib/ai/core/types';

/**
 * Anthropic AI 客户端类
 * 继承自 BaseClient，用于与Anthropic AI提供商交互
 */
class AnthropicClient extends BaseClient {
    anthropic: AnthropicProvider;

    /**
     * 构造函数
     * @param config - 配置信息
     */
    constructor(config: ModelConfigWithProvider) {
        super(config);

        // 初始化实例
        this.anthropic = createAnthropic({
            baseURL: config.provider.apiUrl ?? 'https://api.anthropic.com/v1', // 默认API 地址
            apiKey: config.provider.apiKey ?? '' // 确保 apiKey 必须提供
        });
    }

    /**
     * 实现抽象方法 _getModel
     * 返回指定模型的语言模型实例
     */
    protected _getModel(): LanguageModel {
        return this.anthropic(this.config.modelId);
    }
}

export default AnthropicClient;
