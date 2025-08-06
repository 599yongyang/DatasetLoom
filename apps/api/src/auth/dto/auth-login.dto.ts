import {IsEmail, IsNotEmpty, IsString} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthLoginDto {

    @ApiProperty({ description: '邮箱' })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ description: '密码' })
    @IsString()
    @IsNotEmpty()
    password: string;
}
