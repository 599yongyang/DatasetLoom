import { Injectable } from '@nestjs/common';
import {
    generateText,
    streamText,
    type UIMessage,
    type LanguageModel,
    type Message,
    type CoreUserMessage,
    appendResponseMessages, embed
} from 'ai';
import { ModelConfigWithProvider } from '@/common/prisma/type';
import { MessageUtil } from '@/common/ai/utils';
import { IAIProvider } from '../interfaces/ai-provider.interface';
import { ChatMessages, ModelUsage } from '@prisma/client';
import { ChatService } from '@/chat/chat.service';
import { ModelUsageService } from '@/model-usage/model-usage.service';
import { genTitleSystemPrompt } from '@/common/ai/prompts/system';

@Injectable()
export abstract class BaseAIProvider implements IAIProvider {
    protected config: ModelConfigWithProvider;

    protected chatService: ChatService;
    protected modelUsageService: ModelUsageService;

    constructor(config: ModelConfigWithProvider) {
        this.config = config;
    }

    // 设置依赖服务的方法
    setChatService(chatService: ChatService) {
        this.chatService = chatService;
    }

    setModelUsageService(modelUsageService: ModelUsageService) {
        this.modelUsageService = modelUsageService;
    }

    async chat(messages: UIMessage[] | CoreUserMessage[], systemPrompt?: string, options?: any) {
        const model = this.getModel();
        const result = await generateText({
            model,
            system: systemPrompt,
            messages: messages,
            temperature: options?.temperature ?? this.config.temperature ?? 0.7,
            maxTokens: options?.maxTokens ?? this.config.maxTokens ?? 8192
        });

        // 保存模型使用情况
        if (this.modelUsageService && result.usage) {
            await this.modelUsageService.insertModelUsage({
                projectId: this.config.projectId,
                modelConfigId: this.config.id,
                promptTokens: result.usage.promptTokens,
                completionTokens: result.usage.completionTokens,
                totalTokens: result.usage.totalTokens
            } as ModelUsage);
        }

        return result;
    }

    async vision(image: string | Uint8Array | ArrayBuffer | Buffer, prompt: string) {
        const messages: CoreUserMessage[] = [
            {
                role: 'user',
                content: [
                    { type: 'image', image: image },
                    { type: 'text', text: prompt }
                ]
            }
        ];
        return await this.chat(messages);
    }

    async generateTitle(message: Message): Promise<string> {
        const model = this.getModel();
        const { text: title } = await generateText({
            model,
            system: genTitleSystemPrompt,
            prompt: JSON.stringify(message)
        });
        return title;
    }

    chatStream(messages: UIMessage[], chatId: string, userMessage: UIMessage, systemPrompt: string, options: any = {}) {
        const model = this.getModel();
        const chatStorageService = this.chatService;
        const result = streamText({
            model,
            system: systemPrompt,
            messages,
            temperature: options.temperature ?? this.config.temperature ?? 0.7,
            maxTokens: options.maxTokens ?? this.config.maxTokens ?? 8192,
            onFinish: async ({ response }) => {
                if (!chatStorageService) {
                    console.warn('ChatStorageService not available, skipping message save');
                    return;
                }
                try {
                    const assistantId = MessageUtil.getTrailingMessageId({
                        messages: response.messages.filter(message => message.role === 'assistant')
                    });

                    if (!assistantId) {
                        throw new Error('No assistant message found!');
                    }

                    const [, assistantMessage] = appendResponseMessages({
                        messages: [userMessage],
                        responseMessages: response.messages
                    });
                    await chatStorageService.insertChatMessage({
                        id: assistantId,
                        chatId: chatId,
                        role: assistantMessage?.role,
                        parts: JSON.stringify(assistantMessage?.parts),
                        attachments: JSON.stringify(assistantMessage?.experimental_attachments ?? [])
                    } as ChatMessages);
                } catch (error) {
                    console.error('Failed to save chat:', error);
                }
            }
        });
        return result;
    }


    async embedding(text: string): Promise<any> {
        const embeddingModel = this.getEmbedModel();
        if (embeddingModel) {
            const { embedding } = await embed({
                model: embeddingModel,
                value: text
            });
            return embedding;
        }
        throw new Error('Embedding not implemented for this provider');
    }


    protected abstract getModel(): LanguageModel;

    protected abstract getEmbedModel();
}
