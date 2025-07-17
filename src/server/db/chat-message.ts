import type { ChatMessages } from '@prisma/client';
import { db } from '@/server/db/db';

export async function saveChatMessage(message: ChatMessages) {
    try {
        return await db.chatMessages.create({ data: message });
    } catch (error) {
        console.error('Failed to save messages in database', error);
        throw error;
    }
}

export async function getMessagesByChatId(id: string) {
    try {
        return await db.chatMessages.findMany({ where: { chatId: id }, orderBy: { createdAt: 'asc' } });
    } catch (error) {
        console.error('Failed to get messages by chat id from database', error);
        throw error;
    }
}
