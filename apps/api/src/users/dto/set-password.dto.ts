import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetPasswordDto {
    @ApiProperty({ description: '密码' })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({ description: '确认密码' })
    @IsString()
    @IsNotEmpty()
    confirmNewPassword: string;

    @ApiProperty({ description: '新密码' })
    @IsString()
    @IsNotEmpty()
    newPassword: string;
}
