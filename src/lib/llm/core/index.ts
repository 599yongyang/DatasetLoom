/**
 * LLM API 统一调用工具类
 * 支持多种模型提供商：OpenAI、Ollama、智谱AI等
 * 支持普通输出和流式输出
 */
import { DEFAULT_MODEL_SETTINGS } from '@/constants/model';
import OllamaClient from './providers/ollama'; // 导入 OllamaClient
import OpenAIClient from './providers/openai'; // 导入 OpenAIClient
import ZhiPuClient from './providers/zhipu'; // 导入 ZhiPuClient
import OpenRouterClient from './providers/openrouter'; // 导入 OpenRouterClient
import { Schema } from 'zod';
import DeepSeekClient from '@/lib/llm/core/providers/deepseek';
import OpenAICompatibleClient from '@/lib/llm/core/providers/openai-compatible';
import GoogleClient from '@/lib/llm/core/providers/google';
import AnthropicClient from '@/lib/llm/core/providers/anthropic';

/* eslint-disable @typescript-eslint/no-explicit-any @typescript-eslint/no-unsafe-assignment */

// 定义配置接口
interface Config {
    providerId?: string;
    endpoint?: string;
    apiKey?: string;
    modelId?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
}

// 定义消息接口
interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

class LLMClient {
    private config: Required<Config>;
    private client: any;

    /**
     * 创建 LLM 客户端实例
     * @param config - 配置信息
     */
    constructor(config: Config = {}) {
        this.config = {
            providerId: config.providerId?.toLowerCase() ?? 'openai-compatible',
            endpoint: this._handleEndpoint(config.providerId, config.endpoint) ?? '',
            apiKey: config.apiKey ?? '',
            modelId: config.modelId ?? '',
            temperature: config.temperature ?? DEFAULT_MODEL_SETTINGS.temperature,
            maxTokens: config.maxTokens ?? DEFAULT_MODEL_SETTINGS.maxTokens,
            topP: config.topP ?? 0,
            topK: config.topK ?? 0
        };

        // 动态创建客户端实例
        this.client = this._createClient(this.config.providerId, this.config);
    }

    /**
     * 处理 API 端点兼容性问题
     * @param provider - 提供商名称
     * @param endpoint - 原始端点
     * @returns 格式化后的端点
     */
    private _handleEndpoint(provider: string | undefined, endpoint: string | undefined): string {
        if (!endpoint) return '';

        if (provider === 'ollama') {
            // 兼容 Ollama 的端点格式
            return endpoint.replace(/v1\/?$/, 'api');
        }

        // 移除多余的路径部分
        return endpoint.replace('/chat/completions', '');
    }

    /**
     * 根据提供商动态创建客户端实例
     * @param provider - 提供商名称
     * @param config - 配置信息
     * @returns 返回对应的客户端实例
     */
    private _createClient(provider: string, config: Required<Config>): any {
        switch (provider.toLowerCase()) {
            case 'ollama':
                return new OllamaClient(config);
            case 'openai':
                return new OpenAIClient(config);
            case 'google':
                return new GoogleClient(config);
            case 'anthropic':
                return new AnthropicClient(config);
            case 'deepseek':
                return new DeepSeekClient(config);
            case 'zhipu':
                return new ZhiPuClient(config);
            case 'openrouter':
                return new OpenRouterClient(config);
            default:
                return new OpenAICompatibleClient(config);
        }
    }

    /**
     * 调用客户端方法并处理错误
     * @param method - 方法名
     * @param args - 方法参数
     * @returns 返回方法执行结果
     */
    private async _callClientMethod(method: string, ...args: any[]): Promise<any> {
        try {
            return await this.client[method](...args);
        } catch (error) {
            console.error(`${this.config.providerId} API 调用出错:`, error);
            throw error;
        }
    }

    /**
     * 生成对话响应
     * @param prompt - 用户输入的提示词或对话历史
     * @param responseType - 响应数据返回类型
     * @param options - 可选参数
     * @param schema - 模型响应的 zod 验证器
     * @returns 返回模型响应
     */
    async chat(
        prompt: string | Message[],
        responseType: string | 'all' | 'text' | 'textAndReasoning' = 'text',
        options: Partial<Config> = {},
        schema?: Schema
    ) {
        const messages = Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }];
        const mergedOptions = { ...this.config, ...options };
        const response = await this._callClientMethod('chat', messages, mergedOptions, schema);
        // 根据 responseType 返回不同格式
        switch (responseType) {
            case 'all':
                return response;
            case 'text':
                return response.text;
            case 'textAndReasoning':
                return {
                    text: response.text,
                    reasoning: response.reasoning
                };
            default:
                return response;
        }
    }

    /**
     * 流式生成对话响应
     * @param prompt - 用户输入的提示词或对话历史
     * @param options - 可选参数
     * @returns 返回可读流
     */
    async chatStream(prompt: string | Message[], options: Partial<Config> = {}) {
        const messages = Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }];
        const mergedOptions = { ...this.config, ...options };
        return this._callClientMethod('chatStream', messages, mergedOptions);
    }
}

export default LLMClient;
