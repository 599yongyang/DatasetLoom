import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
    @ApiProperty({ description: '项目名称' })
    @IsString()
    name: string;

    @ApiProperty({ description: '项目描述' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: '复制配置的项目id' })
    @IsString()
    @IsOptional()
    copyId?: string;
}
