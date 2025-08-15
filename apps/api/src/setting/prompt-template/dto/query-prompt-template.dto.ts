import { IsOptional } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class QueryPromptTemplateDto extends PaginationDto {

    @ApiProperty({ description: '搜索关键字' })
    @IsOptional()
    name?: string;

}
