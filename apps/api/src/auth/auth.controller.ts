import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthRegisterDto } from '@/auth/dto/auth-register.dto';
import { AuthLoginDto } from '@/auth/dto/auth-login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('用户认证')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Public()
    @Post('register')
    @ApiOperation({ summary: '注册' })
    registerUser(@Body() registerDto: AuthRegisterDto) {
        return this.authService.register(registerDto);
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: '登录' })
    async login(@Body() loginDto: AuthLoginDto) {
        return this.authService.login(loginDto);
    }
}
