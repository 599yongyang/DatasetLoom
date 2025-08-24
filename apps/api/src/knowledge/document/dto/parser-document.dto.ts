import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentScope } from '@repo/shared-types';

export class ParserDocumentDto {

    @ApiProperty({ description: '文档作用域' })
    @IsEnum(DocumentScope)
    scope: DocumentScope;

    @ApiProperty({ description: '数据源类型' })
    @IsString()
    sourceType: string;

    @ApiProperty({ description: '解析服务' })
    @IsString()
    selectedService: string;

    @ApiProperty({ description: 'web文件地址' })
    @IsString()
    webFileUrls?: string;

    @ApiProperty({ description: 'web地址' })
    @IsString()
    webUrls: string;
}
