import { IsOptional } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class QueryDocumentChunkDto extends PaginationDto {

    @ApiProperty({ description: '搜索关键字' })
    @IsOptional()
    query: string;

    @ApiProperty({ description: '文件id' })
    @IsOptional()
    fileIds: string[];

    @ApiProperty({ description: '状态' })
    @IsOptional()
    status: string;

}
