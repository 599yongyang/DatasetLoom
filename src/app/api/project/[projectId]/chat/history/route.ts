import { NextRequest, NextResponse } from 'next/server';
import { getChatsByUserId } from '@/server/db/chat';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from 'src/server/db/types';
import type { ApiContext } from '@/types/api-context';

/**
 * 获取聊天列表
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: NextRequest, context: ApiContext) => {
    try {
        const { searchParams } = request.nextUrl;
        const { projectId, user } = context;
        const limit = parseInt(searchParams.get('limit') || '10');
        const startingAfter = searchParams.get('starting_after');
        const endingBefore = searchParams.get('ending_before');

        if (startingAfter && endingBefore) {
            return Response.json('Only one of starting_after or ending_before can be provided!', { status: 400 });
        }
        const chats = await getChatsByUserId({
            id: user.id,
            projectId,
            limit,
            startingAfter,
            endingBefore
        });

        return Response.json(chats);
    } catch (error) {
        console.error('Error get chat List:', error);
        return NextResponse.json({ error: 'Failed to get chat List' }, { status: 500 });
    }
});
