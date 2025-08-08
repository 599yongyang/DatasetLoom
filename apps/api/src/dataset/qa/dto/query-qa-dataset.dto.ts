import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ContextType } from '@repo/shared-types';
import { ApiProperty } from '@nestjs/swagger';

export class QueryQaDatasetDto extends PaginationDto {

    @ApiProperty({ description: '确认状态', enum: ['confirmed', 'unconfirmed'] })
    @IsOptional()
    confirmed?: 'confirmed' | 'unconfirmed';

    @ApiProperty({ description: '数据类型', enum: ['question', 'answer'] })
    @IsOptional()
    @IsEnum(ContextType)
    contextType?: ContextType;

    @ApiProperty({ description: '查询条件' })
    @IsOptional()
    query?: string;

    @ApiProperty({ description: '显示类型', enum: ['raw', 'sft', 'dpo'] })
    @IsNotEmpty()
    showType: 'raw' | 'sft' | 'dpo' = 'raw';
}
