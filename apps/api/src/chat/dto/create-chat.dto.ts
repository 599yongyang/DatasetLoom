import { IsArray, IsString } from 'class-validator';
import { UIMessage } from 'ai';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
    @ApiProperty({ description: '会话标识' })
    @IsString()
    id: string;

    @ApiProperty({ description: '消息数据' })
    @IsArray()
    messages: UIMessage[];

    @ApiProperty({ description: '模型配置ID' })
    @IsString()
    modelConfigId: string;
}
