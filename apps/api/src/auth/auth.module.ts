import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import refreshConfig from './config/refresh.config';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { PermissionGuard } from '@/auth/guards/project-role/permission.guard';
import { PermissionsModule } from '@/common/permissions/permissions.module';

@Module({
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, {
        provide: APP_GUARD,
        useClass: JwtAuthGuard
    }, {
        provide: APP_GUARD,
        useClass: PermissionGuard
    }],
    imports: [UsersModule, PermissionsModule,
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
        ConfigModule.forFeature(refreshConfig)
    ]
})
export class AuthModule {
}
