import { createGoogleGenerativeAI, type GoogleGenerativeAIProvider } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';
import { BaseClient } from './base';
import type { ModelConfigWithProvider } from '@/lib/ai/core/types';

/**
 * Google AI 客户端类
 * 继承自 BaseClient，用于与Google AI提供商交互
 */
class GoogleClient extends BaseClient {
    google: GoogleGenerativeAIProvider;

    /**
     * 构造函数
     * @param config - 配置信息
     */
    constructor(config: ModelConfigWithProvider) {
        super(config);

        // 初始化实例
        this.google = createGoogleGenerativeAI({
            baseURL: config.provider.apiUrl ?? 'https://generativelanguage.googleapis.com/v1beta', // 默认API 地址
            apiKey: config.provider.apiKey ?? '' // 确保 apiKey 必须提供
        });
    }

    /**
     * 实现抽象方法 _getModel
     * 返回指定模型的语言模型实例
     */
    protected _getModel(): LanguageModel {
        return this.google(this.config.modelId);
    }
}

export default GoogleClient;
