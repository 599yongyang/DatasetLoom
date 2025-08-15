import { IsString } from 'class-validator';
import { BaseDto } from '@/common/dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GenQuestionImageDto extends BaseDto {

    @ApiProperty({ description: '图像标识' })
    @IsString()
    imageId: string;

    @ApiProperty({ description: '生成问题prompt' })
    @IsString()
    prompt: string;

    @ApiProperty({ description: '模型标识' })
    @IsString()
    modelId: string;
}
