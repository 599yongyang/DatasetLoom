import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ContextType } from '@/common/prisma/enum';
import { ApiProperty } from '@nestjs/swagger';

export class QueryQuestionDto extends PaginationDto {

    @ApiProperty({ description: '是否已回答' })
    @IsOptional()
    @IsBoolean()
    answered?: boolean;

    @ApiProperty({ description: '数据类型' })
    @IsOptional()
    @IsEnum(ContextType)
    contextType?: ContextType;

    @ApiProperty({ description: '查询条件' })
    @IsOptional()
    query?: string;

}
