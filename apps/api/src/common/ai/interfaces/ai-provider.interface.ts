import { UIMessage, CoreUserMessage, Message, LanguageModel } from 'ai';
import { ModelConfigWithProvider } from '@/common/prisma/type';

export interface IAIProvider {
    chat(messages: UIMessage[] | CoreUserMessage[], systemPrompt?: string, options?: any): Promise<any>;

    vision(image: string | Uint8Array | ArrayBuffer | Buffer, prompt: string): Promise<any>;

    generateTitle(message: Message): Promise<string>;

    chatStream(messages: UIMessage[], chatId: string, userMessage: UIMessage, systemPrompt: string, options?: any);

    embedding(text: string);
}

export interface IAIProviderFactory {
    create(config: ModelConfigWithProvider): IAIProvider;
}
