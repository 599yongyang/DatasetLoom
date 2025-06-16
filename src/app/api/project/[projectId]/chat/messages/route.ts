import { getMessagesByChatId } from '@/lib/db/chat-message';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ChatVisibilityType, ProjectRole } from '@/schema/types';
import type { ApiContext } from '@/types/api-context';
import { getChatById } from '@/lib/db/chat';

/**
 * 获取聊天消息
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { searchParams } = new URL(request.url);
        const chatId = searchParams.get('chatId');
        if (!chatId) {
            return new Response('Not Found', { status: 404 });
        }
        const { user } = context;
        const chat = await getChatById(chatId);
        if (!chat || (chat.userId !== user.id && chat.visibility !== ChatVisibilityType.PUBLIC)) {
            return new Response('Not Found', { status: 404 });
        }
        const messages = await getMessagesByChatId(chatId);

        return Response.json(messages, { status: 200 });
    } catch (error) {
        return new Response('An error occurred while processing your request!', {
            status: 500
        });
    }
});
