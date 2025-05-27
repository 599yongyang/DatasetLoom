import { Schema } from 'zod';
import { createDataStreamResponse, generateText, streamText, Output, type UIMessage, type LanguageModel } from 'ai';
import { processMessages } from '@/lib/utils/file';
import type { ConfigOptions, ModelConfigWithProvider } from '@/lib/llm/core/types';

export class BaseClient {
    protected config: ModelConfigWithProvider;

    constructor(config: ModelConfigWithProvider) {
        this.config = config;
    }

    async chat(messages: UIMessage[], options: ConfigOptions = {}, schema?: Schema) {
        const model = this._getModel();
        const processedMessages = await processMessages(messages);
        const finalOptions = {
            model,
            messages: processedMessages,
            temperature: options.temperature ?? this.config.temperature ?? 0.7,
            maxTokens: options.maxTokens ?? this.config.maxTokens ?? 8192,
            ...(schema ? { experimental_output: Output.object({ schema }) } : {})
        };

        return await generateText(finalOptions);
    }

    async chatStream(messages: UIMessage[], options: ConfigOptions = {}) {
        const model = this._getModel();
        const processedMessages = await processMessages(messages);

        return createDataStreamResponse({
            execute: dataStream => {
                const result = streamText({
                    model,
                    messages: processedMessages,
                    temperature: options.temperature ?? this.config.temperature ?? 0.7,
                    maxTokens: options.maxTokens ?? this.config.maxTokens ?? 8192
                });

                void result.consumeStream();
                result.mergeIntoDataStream(dataStream, { sendReasoning: true });
            },
            onError: error => {
                console.error('Stream error:', error);
                return error instanceof Error ? error.message : 'Stream error occurred';
            }
        });
    }

    protected _getModel(): LanguageModel {
        throw new Error('_getModel 子类方法必须实现');
    }
}
