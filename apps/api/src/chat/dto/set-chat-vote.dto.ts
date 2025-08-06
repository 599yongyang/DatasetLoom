import { IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetChatVoteDto {

    @ApiProperty({ description: '会话ID' })
    @IsString()
    chatId: string;

    @ApiProperty({ description: '消息ID' })
    @IsString()
    messageId: string;

    @IsString()
    @IsIn(['up', 'down'])
    @ApiProperty({ description: '会话可见性', enum: ['up', 'down'] })
    type: 'up' | 'down';
}
