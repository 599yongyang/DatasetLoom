import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParserDocumentDto {
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
