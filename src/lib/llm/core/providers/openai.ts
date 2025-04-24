import { createOpenAI, type OpenAIProvider } from '@ai-sdk/openai';
import BaseClient, { type Config } from './base';
import type { LanguageModel } from 'ai';

/**
 * OpenAI 客户端类
 * 继承自 BaseClient，用于与 OpenAI 提供商交互
 */
class OpenAIClient extends BaseClient {
    private openai: OpenAIProvider;

    /**
     * 构造函数
     * @param config - 配置信息
     */
    constructor(config: Config) {
        super(config);

        // 初始化 OpenAI 实例
        this.openai = createOpenAI({
            baseURL: config.endpoint ?? 'https://api.openai.com/v1', // 默认 OpenAI API 地址
            apiKey: config.apiKey ?? '' // 确保 apiKey 必须提供
        });
    }

    /**
     * 实现抽象方法 _getModel
     * 返回指定模型的语言模型实例
     */
    protected _getModel(): LanguageModel {
        if (!this.modelId) {
            throw new Error('Model name is not defined in the configuration.');
        }
        return this.openai(this.modelId);
    }
}

export default OpenAIClient;
