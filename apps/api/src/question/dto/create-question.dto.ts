import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { BaseDto } from '@/common/dto/base.dto';
import { ContextType } from '@/common/prisma/enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto extends BaseDto {

    @ApiProperty({ description: '问题' })
    @IsArray()
    questions: string[];

    @ApiProperty({ description: '数据类型' })
    @IsEnum(ContextType)
    contextType: ContextType;

    @ApiProperty({ description: '数据id' })
    @IsNotEmpty()
    contextId: string;

    @ApiProperty({ description: '数据名称' })
    @IsNotEmpty()
    contextName: string;
}
