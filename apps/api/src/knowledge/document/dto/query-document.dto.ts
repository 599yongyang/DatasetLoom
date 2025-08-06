import { IsOptional } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class QueryDocumentDto extends PaginationDto {

    @ApiProperty({ description: '文件名' })
    @IsOptional()
    fileName: string;

    @ApiProperty({ description: '文件类型' })
    @IsOptional()
    fileExt: string;

}
