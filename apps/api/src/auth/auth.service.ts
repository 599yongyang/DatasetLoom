import {ConflictException, Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {UsersService} from '@/users/users.service';
import {verify} from 'argon2';
import {AuthJwtPayload} from './types/auth-jwtPayload';
import {JwtService} from '@nestjs/jwt';
import refreshConfig from './config/refresh.config';
import {ConfigType} from '@nestjs/config';
import {AuthLoginDto} from "@/auth/dto/auth-login.dto";
import {AuthRegisterDto} from "@/auth/dto/auth-register.dto";
import {ResponseUtil} from "@/utils/response.util";

@Injectable()
export class AuthService {
    constructor(private readonly userService: UsersService,
                private readonly jwtService: JwtService,
                @Inject(refreshConfig.KEY)
                private refreshTokenConfig: ConfigType<typeof refreshConfig>) {
    }

    async register(registerDto: AuthRegisterDto) {
        const user = await this.userService.findByEmail(registerDto.email);
        if (user) {
            throw new ConflictException('Email already exists');
        }
        const data = await this.userService.create(registerDto);
        return ResponseUtil.success({
            id: data.id,
            name: data.name,
            email: data.email,
            avatar: data.avatar || '',
        }, 'User registered successfully');
    }

    async login(loginDto: AuthLoginDto) {
        const user = await this.userService.findByEmail(loginDto.email);
        if (!user) throw ResponseUtil.error('User does not exist:' + loginDto.email);
        const isPasswordMatched = await verify(user.password, loginDto.password);
        if (!isPasswordMatched) {
            throw new UnauthorizedException('Invalid Credentials!');
        }
        const {accessToken, refreshToken} = await this.generateTokens(user.id);
        const {password, ...userWithoutPassword} = user;
        return ResponseUtil.success({
            ...userWithoutPassword,
            accessToken,
            refreshToken,
        }, 'Login Successful')
    }

    async generateTokens(userId: string) {
        const payload: AuthJwtPayload = {sub: userId};
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, this.refreshTokenConfig),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    async validateJwtUser(userId: string) {
        const user = await this.userService.getInfoById(userId);
        if (!user) throw new UnauthorizedException('User not found!');
        const currentUser = {id: user.id, role: user.role};
        return currentUser;
    }

}
