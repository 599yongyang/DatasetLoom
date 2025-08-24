import { PaginationDto } from '@/common/dto/pagination.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryPretrainDto extends PaginationDto {

    @ApiProperty({ description: '搜索关键字' })
    @IsString()
    @IsOptional()
    query: string;
}
