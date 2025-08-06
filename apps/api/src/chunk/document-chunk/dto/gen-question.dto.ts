import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseDto } from '@/common/dto/base.dto';
import { Language } from '@/common/ai/prompts/type';
import { ApiProperty } from '@nestjs/swagger';

export class GenQuestionDto extends BaseDto {

    @ApiProperty({ description: '文档分块标识' })
    @IsString()
    @IsNotEmpty()
    chunkId: string;

    @ApiProperty({ description: '模型配置标识' })
    @IsString()
    @IsNotEmpty()
    modelConfigId: string;

    @ApiProperty({ description: '问题数量类型' })
    @IsString()
    questionCountType: string;


    @ApiProperty({ description: '问题数量' })
    @IsNumber()
    questionCount: number;

    @ApiProperty({ description: '温度' })
    @IsNumber()
    temperature: number;

    @ApiProperty({ description: '最大生成长度' })
    @IsNumber()
    maxTokens: number;

    @ApiProperty({ description: '难易度' })
    @IsString()
    difficulty: string;

    @ApiProperty({ description: '风格' })
    @IsString()
    genre: string;

    @ApiProperty({ description: '目标人群' })
    @IsString()
    audience: string;

    @ApiProperty({ description: '语言' })
    @IsString()
    language: Language;
}
