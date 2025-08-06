import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {

    @ApiProperty({ description: '全局prompt' })
    @IsOptional()
    globalPrompt: string;

    @ApiProperty({ description: '问题prompt' })
    @IsOptional()
    questionPrompt: string;

    @ApiProperty({ description: '答案prompt' })
    @IsOptional()
    answerPrompt: string;

    @ApiProperty({ description: '标签prompt' })
    @IsOptional()
    labelPrompt: string;

    @ApiProperty({ description: '领域树prompt' })
    @IsOptional()
    domainTreePrompt: string;

}
