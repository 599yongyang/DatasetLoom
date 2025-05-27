import { createDeepSeek, type DeepSeekProvider } from '@ai-sdk/deepseek';
import type { LanguageModel } from 'ai';
import { BaseClient } from '@/lib/llm/providers/base';
import type { ModelConfigWithProvider } from '@/lib/llm/core/types';

/**
 * DeepSeek AI 客户端类
 * 继承自 BaseClient，用于与DeepSeek AI提供商交互
 */
class DeepSeekClient extends BaseClient {
    deepseek: DeepSeekProvider;

    /**
     * 构造函数
     * @param config - 配置信息
     */
    constructor(config: ModelConfigWithProvider) {
        super(config);

        // 初始化实例
        this.deepseek = createDeepSeek({
            baseURL: config.provider.apiUrl ?? 'https://api.deepseek.com/v1', // 默认API 地址
            apiKey: config.provider.apiKey ?? '' // 确保 apiKey 必须提供
        });
    }

    /**
     * 实现抽象方法 _getModel
     * 返回指定模型的语言模型实例
     */
    protected _getModel(): LanguageModel {
        return this.deepseek(this.config.modelId);
    }
}

export default DeepSeekClient;
