import { createOllama, type OllamaProvider } from 'ollama-ai-provider';
import BaseClient, { type Config } from './base';
import type { LanguageModel } from 'ai';

/**
 * Ollama 客户端类
 * 继承自 BaseClient，用于与 Ollama 提供商交互
 */
class OllamaClient extends BaseClient {
    ollama: OllamaProvider;

    /**
     * 构造函数
     * @param config - 配置信息
     */
    constructor(config: Config) {
        super(config);
        // 初始化 Ollama 实例
        this.ollama = createOllama({
            baseURL: config.endpoint ?? 'http://localhost:11434' // 默认本地地址
        });
    }

    /**
     * 实现抽象方法 _getModel
     * 返回指定模型的语言模型实例
     */
    protected _getModel(): LanguageModel {
        return this.ollama(this.modelId);
    }
}

export default OllamaClient;
