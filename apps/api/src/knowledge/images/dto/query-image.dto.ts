import { PaginationDto } from '@/common/dto/pagination.dto';
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryImageDto extends PaginationDto {
    @ApiProperty({ description: '文件名' })
    @IsOptional()
    fileName: string;
}
