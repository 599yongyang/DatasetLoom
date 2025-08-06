import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthLoginDto } from '@/auth/dto/auth-login.dto';

export class AuthRegisterDto extends AuthLoginDto {
    @ApiProperty({ description: '用户名' })
    @IsString()
    name: string;
}
