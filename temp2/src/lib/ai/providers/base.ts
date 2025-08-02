import { Schema } from 'zod';
import {
    createDataStreamResponse,
    generateText,
    streamText,
    Output,
    type UIMessage,
    type LanguageModel,
    type Message,
    appendResponseMessages,
    type CoreUserMessage
} from 'ai';
import { processMessages } from '@/lib/utils/file';
import type { ConfigOptions, ModelConfigWithProvider } from '@/lib/ai/core/types';
import { saveChatMessage } from '@/server/db/chat-message';
import type { ChatMessages, ModelUsage } from '@prisma/client';
import { getTrailingMessageId } from '@/lib/utils';
import { insertModelUsage } from '@/server/db/model-usage';

export class BaseClient {
    protected config: ModelConfigWithProvider;

    constructor(config: ModelConfigWithProvider) {
        this.config = config;
    }

    async chat(messages: UIMessage[] | CoreUserMessage[], options: ConfigOptions = {}, schema?: Schema) {
        const model = this._getModel();
        if (!model) {
            throw new Error('Model configuration is missing or invalid');
        }
        // const processedMessages = await processMessages(messages);
        const finalOptions = {
            model,
            messages: messages,
            temperature: options.temperature ?? this.config.temperature ?? 0.7,
            maxTokens: options.maxTokens ?? this.config.maxTokens ?? 8192,
            ...(schema ? { experimental_output: Output.object({ schema }) } : {})
        };

        const res = await generateText(finalOptions);
        const { usage } = res;
        await insertModelUsage({
            projectId: this.config.projectId,
            modelConfigId: this.config.id,
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            totalTokens: usage.totalTokens
        } as ModelUsage);
        return res;
    }

    async generateTitleFromUserMessage(message: Message) {
        const model = this._getModel();
        const { text: title } = await generateText({
            model,
            system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
            prompt: JSON.stringify(message)
        });

        return title;
    }

    async chatStream(messages: UIMessage[], chatId: string, userMessage: UIMessage, options: ConfigOptions = {}) {
        const model = this._getModel();
        return createDataStreamResponse({
            execute: dataStream => {
                const result = streamText({
                    model,
                    messages,
                    temperature: options.temperature ?? this.config.temperature ?? 0.7,
                    maxTokens: options.maxTokens ?? this.config.maxTokens ?? 8192,
                    onFinish: async ({ response }) => {
                        try {
                            const assistantId = getTrailingMessageId({
                                messages: response.messages.filter(message => message.role === 'assistant')
                            });

                            if (!assistantId) {
                                throw new Error('No assistant message found!');
                            }

                            const [, assistantMessage] = appendResponseMessages({
                                messages: [userMessage],
                                responseMessages: response.messages
                            });

                            await saveChatMessage({
                                id: assistantId,
                                chatId: chatId,
                                role: assistantMessage?.role,
                                parts: JSON.stringify(assistantMessage?.parts),
                                attachments: JSON.stringify(assistantMessage?.experimental_attachments ?? [])
                            } as ChatMessages);
                        } catch (_) {
                            console.error('Failed to save chat');
                        }
                    }
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
