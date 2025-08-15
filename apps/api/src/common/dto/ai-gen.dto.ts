import { BaseDto } from '@/common/dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class AiGenDto extends BaseDto {
    @ApiProperty({ description: '业务Id（如chunkId/questionId）' })
    @IsNotEmpty()
    itemId: string;

    @ApiProperty({ description: '模型名称' })
    @IsNotEmpty()
    modelName: string;

    @ApiProperty({ description: '模型配置ID' })
    @IsNotEmpty()
    modelConfigId: string;

    @ApiProperty({ description: '温度' })
    @IsNumber()
    temperature: number;

    @ApiProperty({ description: '最大生成长度' })
    @IsNumber()
    maxTokens: number;

    @ApiProperty({ description: '模板标识' })
    @IsString()
    @IsOptional()
    templateId?: string;

    @ApiProperty({ description: '变量数据' })
    @IsObject()
    @IsOptional()
    variablesData?: Record<string, any>;
}
