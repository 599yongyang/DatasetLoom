import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class GenTagRelDto {
    @ApiProperty({ description: '文档分块标识' })
    @IsString()
    chunkId: string;

    @ApiProperty({ description: '模型配置标识' })
    @IsString()
    modelConfigId: string;

    @ApiProperty({ description: '语言' })
    @IsString()
    language: string;
}
