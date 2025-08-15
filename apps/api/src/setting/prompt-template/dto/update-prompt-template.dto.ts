import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatePromptTemplateDto {
    @ApiProperty({ description: 'ID' })
    @IsString()
    id: string;

    @ApiProperty({ description: '内容' })
    @IsString()
    content: string;

    @ApiProperty({ description: '变量配置' })
    @IsString()
    variables: string;
}
