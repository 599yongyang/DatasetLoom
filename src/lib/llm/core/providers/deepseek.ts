import { createDeepSeek, type DeepSeekProvider } from '@ai-sdk/deepseek';
import BaseClient, { type Config } from './base';
import type { LanguageModel } from 'ai';

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
    constructor(config: Config) {
        super(config);

        // 初始化实例
        this.deepseek = createDeepSeek({
            baseURL: config.endpoint ?? 'https://api.deepseek.com/v1', // 默认API 地址
            apiKey: config.apiKey ?? '' // 确保 apiKey 必须提供
        });
    }

    /**
     * 实现抽象方法 _getModel
     * 返回指定模型的语言模型实例
     */
    protected _getModel(): LanguageModel {
        return this.deepseek(this.modelId);
    }
}

export default DeepSeekClient;
