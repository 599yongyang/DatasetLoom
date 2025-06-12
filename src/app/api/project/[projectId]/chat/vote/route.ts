import { auth } from '@/server/auth';
import { getVotesByChatId, voteMessage } from '@/lib/db/chat-message-vote';
import { getChatById } from '@/lib/db/chat';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
        return new Response('chatId is required', { status: 400 });
    }

    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        return new Response('Unauthorized', { status: 401 });
    }

    const chat = await getChatById(chatId);

    if (!chat) {
        return new Response('Chat not found', { status: 404 });
    }

    if (chat.userId !== session.user.id) {
        return new Response('Unauthorized', { status: 401 });
    }

    const votes = await getVotesByChatId(chatId);

    return Response.json(votes, { status: 200 });
}

export async function PATCH(request: Request) {
    try {
        const { chatId, messageId, type }: { chatId: string; messageId: string; type: 'up' | 'down' } =
            await request.json();

        if (!chatId || !messageId || !type) {
            return new Response('messageId and type are required', { status: 400 });
        }

        const session = await auth();

        if (!session || !session.user || !session.user.email) {
            return new Response('Unauthorized', { status: 401 });
        }

        const chat = await getChatById(chatId);

        if (!chat) {
            return new Response('Chat not found', { status: 404 });
        }

        if (chat.userId !== session.user.id) {
            return new Response('Unauthorized', { status: 401 });
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
}
