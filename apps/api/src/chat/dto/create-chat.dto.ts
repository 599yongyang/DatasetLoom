import { IsArray, IsBoolean, IsString } from 'class-validator';
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
    @IsString({ message: '请选择模型' })
    modelConfigId: string;

    @ApiProperty({ description: '是否RAG' })
    @IsBoolean()
    isRAG: boolean;
}
