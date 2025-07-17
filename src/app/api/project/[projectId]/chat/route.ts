import { NextResponse } from 'next/server';
import LLMClient from '@/lib/ai/core';
import { getModelConfigById } from '@/server/db/model-config';
import { deleteChatById, getChatById, saveChat, updateChatVisiblityById } from '@/server/db/chat';
import { getMostRecentUserMessage } from '@/lib/utils';
import type { Chat, ChatMessages } from '@prisma/client';
import { saveChatMessage } from '@/server/db/chat-message';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from 'src/server/db/types';
import { AuditLog } from '@/lib/middleware/audit-log';
import type { ApiContext } from '@/types/api-context';

/**
 * 创建会话
 */
export const POST = compose(
    AuthGuard(ProjectRole.OWNER),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId, user } = context;
        const { id, messages, model } = await request.json();

        if (!model || !messages) {
            return NextResponse.json({ error: 'Missing necessary parameters' }, { status: 400 });
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
            await saveChat({ id, userId: user.id, title, projectId } as Chat);
        } else {
            if (chat.userId !== user.id) {
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

        // 返回流式响应
        return await llmClient.chatStream(messages, id, userMessage);
    } catch (error) {
        console.error('Failed to process stream chat request:', error);
        return NextResponse.json(
            { error: `Failed to process stream chat request: ${error instanceof Error ? error.message : error}` },
            { status: 500 }
        );
    }
});

/**
 * 获取会话
 */
export const GET = compose(AuthGuard(ProjectRole.OWNER))(async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return new Response('Not Found', { status: 404 });
        }
        const chat = await getChatById(id);
        if (!chat) {
            return new Response('Not Found', { status: 404 });
        }

        return Response.json(chat, { status: 200 });
    } catch (error) {
        return new Response('An error occurred while processing your request!', {
            status: 500
        });
    }
});

/**
 * 删除会话
 */
export const DELETE = compose(
    AuthGuard(ProjectRole.OWNER),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return new Response('Not Found', { status: 404 });
        }
        const chat = await getChatById(id);
        if (!chat) {
            return new Response('Not Found', { status: 404 });
        }
        await deleteChatById(id);

        return new Response('Chat deleted', { status: 200 });
    } catch (error) {
        return new Response('An error occurred while processing your request!', {
            status: 500
        });
    }
});

/**
 * 修改会话可见性
 */
export const PUT = compose(
    AuthGuard(ProjectRole.OWNER),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { chatId, visibility } = await request.json();

        if (!chatId || !visibility) {
            return NextResponse.json({ error: 'Missing necessary parameters' }, { status: 400 });
        }
        const chat = await getChatById(chatId);
        if (!chat) {
            return new Response('Not Found', { status: 404 });
        }
        await updateChatVisiblityById({ chatId, visibility });
        return new Response('Chat updated', { status: 200 });
    } catch (error) {
        console.error('Failed to process update chat request:', error);
        return NextResponse.json(
            { error: `Failed to process update chat request: ${error instanceof Error ? error.message : error}` },
            { status: 500 }
        );
    }
});
