import { NextResponse } from 'next/server';
import LLMClient from '@/lib/llm/core';
import { getModelConfigById } from '@/lib/db/model-config';
import { auth } from '@/server/auth';
import { deleteChatById, getChatById, saveChat } from '@/lib/db/chat';
import { getMostRecentUserMessage } from '@/lib/utils';
import type { Chat, ChatMessages } from '@prisma/client';
import { saveChatMessage } from '@/lib/db/chat-message';

type Params = Promise<{ projectId: string }>;

export async function POST(request: Request, props: { params: Params }) {
    const params = await props.params;
    const { projectId } = params;

    try {
        const { id, messages, model } = await request.json();

        if (!model || !messages) {
            return NextResponse.json({ error: 'Missing necessary parameters' }, { status: 400 });
        }

        const session = await auth();

        if (!session || !session.user || !session.user.id) {
            return new Response('Unauthorized', { status: 401 });
        }
        const userMessage = getMostRecentUserMessage(messages);

        if (!userMessage) {
            return new Response('No user message found', { status: 400 });
        }
        let modelConfig = await getModelConfigById(model.id);
        if (!modelConfig) {
            return NextResponse.json({ error: 'Model config not found' }, { status: 400 });
        }
        // 创建 LLM 客户端
        const llmClient = new LLMClient(modelConfig);

        const chat = await getChatById(id);

        if (!chat) {
            const title = await llmClient.generateTitleFromUserMessage(userMessage);
            await saveChat({ id, userId: session.user.id, title, projectId } as Chat);
        } else {
            if (chat.userId !== session.user.id) {
                return new Response('Unauthorized', { status: 401 });
            }
        }
        await saveChatMessage({
            chatId: id,
            id: userMessage.id,
            role: 'user',
            parts: JSON.stringify(userMessage.parts),
            attachments: ''
        } as ChatMessages);

        try {
            // 返回流式响应
            return await llmClient.chatStream(messages, id, userMessage);
        } catch (error) {
            console.error('Failed to call LLM API:', error);
            return NextResponse.json(
                {
                    error: `Failed to call ${model.provider} model: ${error instanceof Error ? error.message : error}`
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Failed to process stream chat request:', error);
        return NextResponse.json(
            { error: `Failed to process stream chat request: ${error instanceof Error ? error.message : error}` },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return new Response('Not Found', { status: 404 });
    }

    const session = await auth();

    if (!session || !session.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const chat = await getChatById(id);
        if (!chat) {
            return new Response('Not Found', { status: 404 });
        }
        if (chat.userId !== session.user.id) {
            return new Response('Unauthorized', { status: 401 });
        }

        return Response.json(chat, { status: 200 });
    } catch (error) {
        return new Response('An error occurred while processing your request!', {
            status: 500
        });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return new Response('Not Found', { status: 404 });
    }

    const session = await auth();

    if (!session || !session.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const chat = await getChatById(id);
        if (!chat) {
            return new Response('Not Found', { status: 404 });
        }
        if (chat.userId !== session.user.id) {
            return new Response('Unauthorized', { status: 401 });
        }

        await deleteChatById(id);

        return new Response('Chat deleted', { status: 200 });
    } catch (error) {
        return new Response('An error occurred while processing your request!', {
            status: 500
        });
    }
}
