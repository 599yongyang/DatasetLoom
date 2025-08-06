import { IsOptional } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class QueryImageChunkDto extends PaginationDto {

    @ApiProperty({ description: '名称' })
    @IsOptional()
    label: string;

}
