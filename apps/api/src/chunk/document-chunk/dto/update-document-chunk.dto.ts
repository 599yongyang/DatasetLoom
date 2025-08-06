import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentChunkDto {

    @ApiProperty({ description: '文件名称' })
    @IsString()
    name: string;

    @ApiProperty({ description: '文件内容' })
    @IsString()
    content: string;

    @ApiProperty({ description: '文件标签' })
    @IsString()
    tags: string;
}
