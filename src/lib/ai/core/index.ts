import type { ConfigOptions, ModelConfigWithProvider } from './types';
import type { BaseClient } from '../providers/base';
import { createModelClient } from './factory';
import type { CoreUserMessage, Message, UIMessage } from 'ai';
import type { Schema } from 'zod';

/**
 * 统一大模型客户端入口
 */
export default class ModelClient {
    private client: BaseClient;

    /**
     * 构造函数，根据 provider 类型自动创建对应客户端
     * @param config - 模型配置信息（含 provider）
     */
    constructor(config: ModelConfigWithProvider) {
        const providerType = config.provider?.interfaceType || 'openAICompatible';
        this.client = createModelClient(providerType, config);
    }

    async vision(image: string | Uint8Array | ArrayBuffer | Buffer, prompt: string) {
        const msg: CoreUserMessage[] = [
            {
                role: 'user',
                content: [
                    {
                        type: 'image',
                        image: image
                    }
                ]
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: prompt
                    }
                ]
            }
        ];
        return await this.client.chat(msg);
    }

    /**
     * 普通聊天输出
     * @param prompt - 用户输入内容或消息历史
     * @param options - 可选参数（温度、最大 token 等）
     * @param schema - 可选 zod schema 校验格式
     */
    async chat(prompt: string | UIMessage[] | CoreUserMessage[], options?: ConfigOptions, schema?: Schema) {
        const messages = Array.isArray(prompt) ? prompt : ([{ role: 'user', content: prompt }] as UIMessage[]);
        return await this.client.chat(messages, options, schema);
    }

    /**
     * 流式聊天输出
     * @param messages - 用户输入内容或消息历史
     * @param chatId - 聊天 ID
     * @param userMessage - 用户输入消息
     * @param options - 可选参数
     */
    chatStream(messages: UIMessage[], chatId: string, userMessage: UIMessage, options?: ConfigOptions) {
        return this.client.chatStream(messages, chatId, userMessage, options);
    }

    generateTitleFromUserMessage(message: Message) {
        return this.client.generateTitleFromUserMessage(message);
    }
}
