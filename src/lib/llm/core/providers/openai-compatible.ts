import { createOpenAICompatible, type OpenAICompatibleProvider } from '@ai-sdk/openai-compatible';
import BaseClient, { type Config } from './base';
import type { LanguageModel } from 'ai';

/**
 * OpenAI兼容包 客户端类
 * 继承自 BaseClient
 */
class OpenAICompatibleClient extends BaseClient {
    openAICompatible: OpenAICompatibleProvider;

    /**
     * 构造函数
     * @param config - 配置信息
     */
    constructor(config: Config) {
        super(config);

        // 初始化实例
        this.openAICompatible = createOpenAICompatible({
            baseURL: config.endpoint ?? 'https://api.example.com/v1', // 默认API 地址
            name: 'openAICompatible',
            apiKey: config.apiKey ?? '' // 确保 apiKey 必须提供
        });
    }

    /**
     * 实现抽象方法 _getModel
     * 返回指定模型的语言模型实例
     */
    protected _getModel(): LanguageModel {
        return this.openAICompatible(this.modelId);
    }
}

export default OpenAICompatibleClient;
