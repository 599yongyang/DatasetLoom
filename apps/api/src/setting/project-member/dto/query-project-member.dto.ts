import { IsOptional } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class QueryProjectMemberDto extends PaginationDto {

    @ApiProperty({ description: '搜索关键字' })
    @IsOptional()
    query?: string;

}
