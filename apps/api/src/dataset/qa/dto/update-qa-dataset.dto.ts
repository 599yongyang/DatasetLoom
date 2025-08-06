import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateQaDatasetDto {

    @ApiProperty({ description: '答案' })
    @IsString()
    answer: string;
    cot: string;
}
