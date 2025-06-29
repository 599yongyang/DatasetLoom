import { type Chat } from '@prisma/client';
import { db } from '@/server/db';
import { ChatVisibilityType } from '@/schema/types';

type PaginationParams = {
    id: string;
    projectId: string;
    limit: number;
    startingAfter?: string | null;
    endingBefore?: string | null;
};

export async function getChatsByUserId({ id, projectId, limit, startingAfter, endingBefore }: PaginationParams) {
    try {
        const extendedLimit = limit + 1;

        // 公共查询条件
        const baseWhere = {
            OR: [
                { userId: id, projectId },
                { visibility: ChatVisibilityType.PUBLIC, projectId }
            ]
        };

        let chats: Array<Chat> = [];

        if (startingAfter) {
            const cursorChat = await db.chat.findUnique({
                where: { id: startingAfter }
            });

            if (!cursorChat) {
                throw new Error(`Chat with id ${startingAfter} not found`);
            }

            chats = await db.chat.findMany({
                where: {
                    ...baseWhere,
                    createdAt: {
                        gt: cursorChat.createdAt
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: extendedLimit
            });
        } else if (endingBefore) {
            const cursorChat = await db.chat.findUnique({
                where: { id: endingBefore }
            });

            if (!cursorChat) {
                throw new Error(`Chat with id ${endingBefore} not found`);
            }

            chats = await db.chat.findMany({
                where: {
                    ...baseWhere,
                    createdAt: {
                        lt: cursorChat.createdAt
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: extendedLimit
            });
        } else {
            // 获取第一页
            chats = await db.chat.findMany({
                where: baseWhere,
                orderBy: {
                    createdAt: 'desc'
                },
                take: extendedLimit
            });
        }

        const hasMore = chats.length > limit;

        return {
            chats: hasMore ? chats.slice(0, limit) : chats,
            hasMore
        };
    } catch (error) {
        console.error('Failed to get chats by user from database');
        throw error;
    }
}

export async function getChatById(id: string) {
    try {
        return await db.chat.findUnique({ where: { id } });
    } catch (error) {
        console.error('Failed to get chat by id from database');
        throw error;
    }
}

export async function deleteChatById(id: string) {
    try {
        return await db.chat.delete({ where: { id } });
    } catch (error) {
        console.error('Failed to delete chat by id from database');
        throw error;
    }
}

export async function saveChat(chat: Chat) {
    try {
        return await db.chat.create({ data: chat });
    } catch (error) {
        console.error('Failed to save chat in database');
        throw error;
    }
}

export async function updateChatVisiblityById({
    chatId,
    visibility
}: {
    chatId: string;
    visibility: ChatVisibilityType;
}) {
    try {
        return await db.chat.update({ data: { visibility }, where: { id: chatId } });
    } catch (error) {
        console.error('Failed to update chat visibility in database');
        throw error;
    }
}
