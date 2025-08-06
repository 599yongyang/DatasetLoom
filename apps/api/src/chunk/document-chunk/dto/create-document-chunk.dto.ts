import { IsArray, IsNumber, IsString } from 'class-validator';
import { BaseDto } from '@/common/dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentChunkDto extends BaseDto {
    @ApiProperty({ description: '文件Ids' })
    @IsArray()
    fileIds: string[];

    @ApiProperty({ description: '分块策略' })
    @IsString()
    strategy: string;

    @ApiProperty({ description: '分块分隔符' })
    @IsString()
    separators: string[];

    @ApiProperty({ description: '分块大小' })
    @IsNumber()
    chunkSize: number;

    @ApiProperty({ description: '分块重叠长度' })
    @IsNumber()
    chunkOverlap: number;
}
