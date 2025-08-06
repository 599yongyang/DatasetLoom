import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseDto } from '@/common/dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SaveModelConfigDto extends BaseDto {

    @ApiProperty({ description: '模型配置id' })
    @IsOptional()
    id?: string;

    @ApiProperty({ description: '模型服务商id' })
    @IsString()
    providerId: string;

    @ApiProperty({ description: '模型id' })
    @IsString()
    modelId: string;

    @ApiProperty({ description: '模型名称' })
    @IsString()
    modelName: string;

    @ApiProperty({ description: '模型类型' })
    @IsString()
    type: string;

    @ApiProperty({ description: '温度' })
    @IsNumber()
    temperature: number;

    @ApiProperty({ description: '最大tokens' })
    @IsNumber()
    maxTokens: number;

}
