import { IsString } from 'class-validator';
import { ChatVisibilityType } from '@repo/shared-types';
import { ApiProperty } from '@nestjs/swagger';

export class SetChatVisibleDto {
    @ApiProperty({ description: '会话标识' })
    @IsString()
    chatId: string;

    @ApiProperty({ description: '会话可见性', enum: ChatVisibilityType })
    @IsString()
    visibility: ChatVisibilityType;
}
