import {Injectable} from '@nestjs/common';
import {PrismaService} from "@/common/prisma/prisma.service";
import {Chat, ChatMessages} from '@prisma/client';
import {ChatVisibilityType} from "@/common/prisma/enum";


type PaginationParams = {
    id: string;
    projectId: string;
    limit: number;
    startingAfter?: string | null;
    endingBefore?: string | null;
};

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService,) {
    }

    create(chat: Chat) {
        try {
            return this.prisma.chat.create({data: chat});
        } catch (error) {
            console.error('Failed to save chat in database');
            throw error;
        }
    }


    insertChatMessage(message: ChatMessages) {
        try {
            return this.prisma.chatMessages.create({data: message});
        } catch (error) {
            console.error('Failed to save messages in database', error);
            throw error;
        }
    }

    getMessagesByChatId(id: string) {
        try {
            return this.prisma.chatMessages.findMany({where: {chatId: id}, orderBy: {createdAt: 'asc'}});
        } catch (error) {
            console.error('Failed to get messages by chat id from database', error);
            throw error;
        }
    }


    async getChatsByUserId({id, projectId, limit, startingAfter, endingBefore}: PaginationParams) {
        try {
            const extendedLimit = limit + 1;

            // 公共查询条件
            const baseWhere = {
                OR: [
                    {userId: id, projectId},
                    {visibility: ChatVisibilityType.PUBLIC, projectId}
                ]
            };

            let chats: Array<Chat> = [];

            if (startingAfter) {
                const cursorChat = await this.prisma.chat.findUnique({
                    where: {id: startingAfter}
                });

                if (!cursorChat) {
                    throw new Error(`Chat with id ${startingAfter} not found`);
                }

                chats = await this.prisma.chat.findMany({
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
                const cursorChat = await this.prisma.chat.findUnique({
                    where: {id: endingBefore}
                });

                if (!cursorChat) {
                    throw new Error(`Chat with id ${endingBefore} not found`);
                }

                chats = await this.prisma.chat.findMany({
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
                chats = await this.prisma.chat.findMany({
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


    async getInfoById(id: string) {
        try {
            return await this.prisma.chat.findUnique({where: {id}});
        } catch (error) {
            console.error('Failed to get chat by id from database');
            throw error;
        }
    }

    getVotesByChatId(id: string) {
        try {
            return this.prisma.chatMessageVote.findMany({where: {chatId: id}});
        } catch (error) {
            console.error('Failed to get votes by chat id from database', error);
            throw error;
        }
    }

    async voteMessage({
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

            const existingVote = await this.prisma.chatMessageVote.findUnique({
                where: whereCondition
            });

            if (existingVote) {
                // 更新现有投票
                return await this.prisma.chatMessageVote.update({
                    where: whereCondition,
                    data: {
                        isUpvote: type === 'up'
                    }
                });
            } else {
                // 创建新的投票
                return await this.prisma.chatMessageVote.create({
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

    updateChatVisibleById({
                              chatId,
                              visibility
                          }: {
        chatId: string;
        visibility: ChatVisibilityType;
    }) {
        try {
            return this.prisma.chat.update({data: {visibility}, where: {id: chatId}});
        } catch (error) {
            console.error('Failed to update chat visibility in database');
            throw error;
        }
    }


    remove(id: string) {
        try {
            return this.prisma.chat.delete({where: {id}});
        } catch (error) {
            console.error('Failed to delete chat by id from database');
            throw error;
        }
    }
}
