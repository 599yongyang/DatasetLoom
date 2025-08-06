import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { BaseDto } from '@/common/dto/base.dto';
import { Language } from '@/common/ai/prompts/type';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQaDatasetDto extends BaseDto {

    @ApiProperty({ description: '问题ID' })
    @IsNotEmpty()
    questionId: string;

    @ApiProperty({ description: '模型名称' })
    @IsNotEmpty()
    modelName: string;

    @ApiProperty({ description: '模型配置ID' })
    @IsNotEmpty()
    modelConfigId: string;

    @ApiProperty({ description: '温度' })
    @IsNumber()
    @IsOptional()
    temperature?: number;

    @ApiProperty({ description: '最大生成长度' })
    @IsNumber()
    @IsOptional()
    maxTokens?: number;

    @ApiProperty({ description: '生成质量', enum: ['concise', 'normal', 'detailed'] })
    @IsOptional()
    @IsIn(['concise', 'normal', 'detailed'])
    detailLevel?: 'concise' | 'normal' | 'detailed';

    @ApiProperty({ description: '生成方式', enum: ['direct', 'reasoning', 'stepwise', 'explanatory'] })
    @IsOptional()
    @IsIn(['direct', 'reasoning', 'stepwise', 'explanatory'])
    answerStyle?: 'direct' | 'reasoning' | 'stepwise' | 'explanatory';

    @ApiProperty({ description: '是否记录引用来源' })
    @IsOptional()
    @IsBoolean()
    citation?: true;

    @ApiProperty({ description: '语言', enum: ['zh-CN', 'en'] })
    @IsOptional()
    language: Language;
}
