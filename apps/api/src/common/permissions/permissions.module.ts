import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersService } from '@/users/users.service';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { PermissionsService } from '@/common/permissions/permissions.service';


@Module({
    imports: [PrismaModule,CacheModule.register()],
    providers: [UsersService,PermissionsService],
    exports: [PermissionsService],
})
export class PermissionsModule {
}
