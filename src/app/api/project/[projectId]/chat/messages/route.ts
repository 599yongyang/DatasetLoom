import { getMessagesByChatId } from '@/lib/db/chat-message';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
        return new Response('Not Found', { status: 404 });
    }
    try {
        const messages = await getMessagesByChatId(chatId);

        return Response.json(messages, { status: 200 });
    } catch (error) {
        return new Response('An error occurred while processing your request!', {
            status: 500
        });
    }
}
