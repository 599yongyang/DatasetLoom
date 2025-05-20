import { createDataStreamResponse, generateText, type LanguageModel, Output, streamText, type UIMessage } from 'ai';
import { processMessages } from '@/lib/utils/file';
import { Schema } from 'zod';

// 定义配置类型
export interface Config {
    endpoint?: string;
    apiKey?: string;
    modelId?: string;
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
}

// 定义选项类型
interface ChatOptions {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
}

class BaseClient {
    private endpoint: string;
    private apiKey: string;
    protected modelId: string;
    private modelConfig: {
        temperature: number;
        top_p: number;
        max_tokens: number;
    };

    constructor(config: Config) {
        this.endpoint = config.endpoint ?? '';
        this.apiKey = config.apiKey ?? '';
        this.modelId = config.modelId ?? '';
        this.modelConfig = {
            temperature: config.temperature ?? 0.7,
            top_p: config.top_p ?? 0.9,
            max_tokens: config.max_tokens ?? 8192
        };
    }

    /**
     * 普通输出聊天方法
     */
    async chat(messages: UIMessage[], options: ChatOptions = {}, schema?: Schema) {
        const model = this._getModel();
        const generateOptions = {
            model,
            messages,
            temperature: options.temperature ?? this.modelConfig.temperature,
            topP: options.top_p ?? this.modelConfig.top_p,
            maxTokens: options.max_tokens ?? this.modelConfig.max_tokens,
            ...(schema
                ? {
                      experimental_output: Output.object({
                          schema: schema
                      })
                  }
                : {})
        };

        return await generateText(generateOptions);
    }

    /**
     * 流式输出聊天方法
     */
    async chatStream(messages: UIMessage[], options: ChatOptions = {}) {
        const model = this._getModel();
        const msg = await processMessages(messages);
        return createDataStreamResponse({
            execute: dataStream => {
                const result = streamText({
                    model,
                    messages: msg,
                    temperature: options.temperature ?? this.modelConfig.temperature,
                    topP: options.top_p ?? this.modelConfig.top_p,
                    maxTokens: options.max_tokens ?? this.modelConfig.max_tokens
                });
                void result.consumeStream();
                result.mergeIntoDataStream(dataStream, {
                    sendReasoning: true
                });
            },
            onError: error => {
                console.error('Error in streamText:', error);
                return error instanceof Error ? error.message : 'Oops, an error occurred!';
            }
        });
    }

    // 抽象方法
    protected _getModel(): LanguageModel {
        throw new Error('_getModel 子类方法必须实现');
    }
}

export default BaseClient;
