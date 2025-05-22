import { createAnthropic, type AnthropicProvider } from '@ai-sdk/anthropic';
import BaseClient, { type Config } from './base';
import type { LanguageModel } from 'ai';

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
    constructor(config: Config) {
        super(config);

        // 初始化实例
        this.anthropic = createAnthropic({
            baseURL: config.endpoint ?? 'https://api.anthropic.com/v1', // 默认API 地址
            apiKey: config.apiKey ?? '' // 确保 apiKey 必须提供
        });
    }

    /**
     * 实现抽象方法 _getModel
     * 返回指定模型的语言模型实例
     */
    protected _getModel(): LanguageModel {
        return this.anthropic(this.modelId);
    }
}

export default AnthropicClient;
