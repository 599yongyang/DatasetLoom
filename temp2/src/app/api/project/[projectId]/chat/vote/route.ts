import { getVotesByChatId, voteMessage } from '@/server/db/chat-message-vote';
import { getChatById } from '@/server/db/chat';
import { NextResponse } from 'next/server';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from 'src/server/db/types';
import type { ApiContext } from '@/types/api-context';
import { AuditLog } from '@/lib/middleware/audit-log';

/**
 * 获取投票
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { searchParams } = new URL(request.url);
        const chatId = searchParams.get('chatId');

        if (!chatId) {
            return new Response('chatId is required', { status: 400 });
        }
        const { user } = context;

        const chat = await getChatById(chatId);

        if (!chat) {
            return new Response('Chat not found', { status: 404 });
        }

        if (chat.userId !== user.id) {
            return new Response('Unauthorized', { status: 401 });
        }

        const votes = await getVotesByChatId(chatId);

        return Response.json(votes, { status: 200 });
    } catch (error) {
        console.error('Error get voted:', error);
        return NextResponse.json({ error: 'Failed get voted' }, { status: 500 });
    }
});

/**
 * 投票
 */
export const PATCH = compose(
    AuthGuard(ProjectRole.OWNER),
    AuditLog()
)(async (request: Request) => {
    try {
        const {
            chatId,
            messageId,
            type
        }: {
            chatId: string;
            messageId: string;
            type: 'up' | 'down';
        } = await request.json();

        if (!chatId || !messageId || !type) {
            return new Response('messageId and type are required', { status: 400 });
        }

        const chat = await getChatById(chatId);

        if (!chat) {
            return new Response('Chat not found', { status: 404 });
        }

        await voteMessage({
            chatId,
            messageId,
            type: type
        });

        return new Response('Message voted', { status: 200 });
    } catch (error) {
        console.error('Error voted:', error);
        return NextResponse.json({ error: 'Failed voted' }, { status: 500 });
    }
});
