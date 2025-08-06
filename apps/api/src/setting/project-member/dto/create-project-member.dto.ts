import {IsArray, IsEnum} from "class-validator";
import {ProjectRole} from "@/common/prisma/enum";
import {BaseDto} from "@/common/dto/base.dto";
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectMemberDto extends BaseDto {

    @ApiProperty({description: '邮箱列表'})
    @IsArray()
    emails: string[];

    @ApiProperty({description: '角色'})
    @IsEnum(ProjectRole)
    role: ProjectRole;
}
