import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { BaseDto } from '@/common/dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto extends BaseDto {
    @ApiProperty({ description: '页码' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiProperty({ description: '每页数量' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize: number = 10;

}
