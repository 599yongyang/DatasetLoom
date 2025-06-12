import { db } from '@/server/db';

export async function getVotesByChatId(id: string) {
    try {
        return await db.chatMessageVote.findMany({ where: { chatId: id } });
    } catch (error) {
        console.error('Failed to get votes by chat id from database', error);
        throw error;
    }
}

export async function voteMessage({
    chatId,
    messageId,
    type
}: {
    chatId: string;
    messageId: string;
    type: 'up' | 'down';
}) {
    try {
        const whereCondition = {
            chatId_messageId: {
                chatId,
                messageId
            }
        };

        const existingVote = await db.chatMessageVote.findUnique({
            where: whereCondition
        });

        if (existingVote) {
            // 更新现有投票
            return await db.chatMessageVote.update({
                where: whereCondition,
                data: {
                    isUpvote: type === 'up'
                }
            });
        } else {
            // 创建新的投票
            return await db.chatMessageVote.create({
                data: {
                    chatId,
                    messageId,
                    isUpvote: type === 'up'
                }
            });
        }
    } catch (error) {
        console.error('Failed to vote message in database', error);
        throw error;
    }
}
