import {IsEnum, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {ContextType} from "@repo/shared-types";
import { ApiProperty } from '@nestjs/swagger';

export class UpdateQuestionDto {

    @ApiProperty({ description: '问题ID'})
    @IsNotEmpty()
    id: string

    @ApiProperty({ description: '问题'})
    @IsNotEmpty()
    question: string;

    @ApiProperty({ description: '问题类型'})
    @IsEnum(ContextType)
    contextType: ContextType;

    @ApiProperty({ description: '问题标签'})
    @IsString()
    @IsOptional()
    label?: string
}
