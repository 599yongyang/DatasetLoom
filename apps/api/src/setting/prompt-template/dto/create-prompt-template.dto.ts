import { PromptTemplateType } from '@repo/shared-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseDto } from '@/common/dto/base.dto';

export class CreatePromptTemplateDto extends BaseDto {

    @ApiProperty({ description: '模板名称' })
    @IsString()
    name: string;

    @ApiProperty({ description: '模板描述' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: '所属类型' })
    @IsEnum(PromptTemplateType)
    type: PromptTemplateType;
}
