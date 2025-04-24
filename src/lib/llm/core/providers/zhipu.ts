import { createZhipu, type ZhipuProvider } from 'zhipu-ai-provider';
import BaseClient, { type Config } from './base';
import type { LanguageModel } from 'ai';

/**
 * 智谱AI 客户端类
 * 继承自 BaseClient，用于与智谱AI提供商交互
 */
class ZhiPuClient extends BaseClient {
    private zhipu: ZhipuProvider;

    /**
     * 构造函数
     * @param config - 配置信息
     */
    constructor(config: Config) {
        super(config);

        // 初始化智谱AI实例
        this.zhipu = createZhipu({
            baseURL: config.endpoint ?? 'https://api.zhipu.ai', // 默认智谱AI API 地址
            apiKey: config.apiKey ?? '' // 确保 apiKey 必须提供
        });
    }

    /**
     * 实现抽象方法 _getModel
     * 返回指定模型的语言模型实例
     */
    protected _getModel(): LanguageModel {
        return this.zhipu(this.modelId);
    }
}

export default ZhiPuClient;
