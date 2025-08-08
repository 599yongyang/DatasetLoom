import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ResponseUtil } from '@/utils/response.util';
import { ModelConfigService } from '@/setting/model-config/model-config.service';
import { Chat, ChatMessages } from '@prisma/client';
import { User } from '@/auth/decorators/user.decorator';
import { AIService } from '@/common/ai/ai.service';
import { MessageUtil } from '@/common/ai/utils';
import { Response } from 'express';
import { SetChatVoteDto } from '@/chat/dto/set-chat-vote.dto';
import { SetChatVisibleDto } from '@/chat/dto/set-chat-visible.dto';
import { Permission } from '@/auth/decorators/permission.decorator';
import { ProjectRole } from '@repo/shared-types';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('模型对话')
@Controller(':projectId/chat')
export class ChatController {
    constructor(private readonly chatService: ChatService, private readonly modelConfigService: ModelConfigService, private readonly aiService: AIService) {
    }

    @Post()
    @ApiOperation({ summary: '对话' })
    @Permission(ProjectRole.OWNER)
    async create(
        @Param('projectId') projectId: string,
        @Body() createChatDto: CreateChatDto,
        @User('id') userId: string,
        @Res() res: Response
    ) {
        try {
            const { messages, modelConfigId, id } = createChatDto;
            const userMessage = MessageUtil.getMostRecentUserMessage(messages);

            // 验证逻辑
            if (!userMessage) {
                return ResponseUtil.error('No user message found');
            }

            const modelConfig = await this.modelConfigService.getModelConfigById(modelConfigId);
            if (!modelConfig) {
                return ResponseUtil.error('Model config not found');
            }

            // 处理聊天记录
            const chat = await this.chatService.getInfoById(id);
            if (!chat) {
                const title = await this.aiService.generateTitle(modelConfig, userMessage);
                await this.chatService.create({ id, userId, title, projectId } as Chat);
            } else if (chat.userId !== userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // 保存用户消息
            await this.chatService.insertChatMessage({
                chatId: id,
                id: userMessage.id,
                role: 'user',
                parts: JSON.stringify(userMessage.parts),
                attachments: ''
            } as ChatMessages);

            const stream = this.aiService.chatStream(modelConfig, messages, id, userMessage);
            stream.pipeDataStreamToResponse(res);

        } catch (error) {
            console.error('Chat stream error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    @Get('history')
    @ApiOperation({ summary: '获取会话记录' })
    @Permission(ProjectRole.VIEWER)
    async history(@Param('projectId') projectId: string, @Query('limit') limit: number = 10, @Query('starting_after') starting_after: string, @Query('ending_before') ending_before: string, @User('id') userId: string) {

        if (starting_after && ending_before) {
            return ResponseUtil.error('Only one of starting_after or ending_before can be provided!');
        }
        const chats = await this.chatService.getChatsByUserId({
            id: userId,
            projectId,
            limit,
            startingAfter: starting_after,
            endingBefore: ending_before
        });
        return ResponseUtil.success(chats);
    }


    @Get('messages')
    @ApiOperation({ summary: '获取消息数据' })
    @Permission(ProjectRole.VIEWER)
    async messages(@Query('chatId') chatId: string) {
        const data = await this.chatService.getMessagesByChatId(chatId);
        return ResponseUtil.success(data);
    }

    @Get('info')
    @ApiOperation({ summary: '获取会话信息' })
    @Permission(ProjectRole.VIEWER)
    async info(@Query('id') id: string) {
        if (!id) {
            return ResponseUtil.error('Not Found');
        }
        const chat = await this.chatService.getInfoById(id);
        if (!chat) {
            return ResponseUtil.error('Not Found');
        }
        return ResponseUtil.success(chat);
    }

    @Get('vote')
    @ApiOperation({ summary: '获取对话投票数据' })
    @Permission(ProjectRole.VIEWER)
    async vote(@Query('chatId') chatId: string, @User('id') userId: string) {
        const chat = await this.chatService.getInfoById(chatId);
        if (!chat) {
            return ResponseUtil.error('Not Found');
        }
        if (chat.userId !== userId) {
            return ResponseUtil.unauthorized();
        }
        const votes = await this.chatService.getVotesByChatId(chatId);
        return ResponseUtil.success(votes);
    }

    @Patch('vote')
    @ApiOperation({ summary: '设置投票' })
    @Permission(ProjectRole.EDITOR)
    async setVote(@Body() setChatVoteDto: SetChatVoteDto) {
        const { chatId, messageId, type } = setChatVoteDto;
        const chat = await this.chatService.getInfoById(chatId);

        if (!chat) {
            return new Response('Chat not found', { status: 404 });
        }

        await this.chatService.voteMessage({
            chatId,
            messageId,
            type: type
        });

        return ResponseUtil.success();
    }

    @Patch('set-visible')
    @ApiOperation({ summary: '修改会话可见性' })
    @Permission(ProjectRole.OWNER)
    async setVisible(@Body() setChatVisibleDto: SetChatVisibleDto) {
        const { chatId } = setChatVisibleDto;
        const chat = await this.chatService.getInfoById(chatId);

        if (!chat) {
            return new Response('Chat not found', { status: 404 });
        }
        await this.chatService.updateChatVisibleById(setChatVisibleDto);

        return ResponseUtil.success();
    }

    @Delete(':id')
    @ApiOperation({ summary: '删除会话' })
    @Permission(ProjectRole.OWNER)
    async remove(@Param('id') id: string) {
        const chat = await this.chatService.getInfoById(id);
        if (!chat) {
            return ResponseUtil.success();
        }
        await this.chatService.remove(id);
        return ResponseUtil.success();
    }
}
