import { BaseDto } from '@/common/dto/base.dto';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PreferencePairDto extends BaseDto {
    
    @ApiProperty({ description: '问题标识' })
    @IsString()
    questionId: string;

    @ApiProperty({ description: 'prompt' })
    @IsString()
    prompt: string;

    @ApiProperty({ description: '偏好' })
    @IsString()
    chosen: string;

    @ApiProperty({ description: '拒绝' })
    @IsString()
    rejected: string;

    @ApiProperty({ description: '偏好数据集id' })
    @IsString()
    datasetChosenId: string;

    @ApiProperty({ description: '拒绝数据集id' })
    @IsString()
    datasetRejectId: string;
}
