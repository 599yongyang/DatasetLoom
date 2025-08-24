import { Module } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { PermissionsService } from '@/common/permissions/permissions.service';


@Module({
    imports: [PrismaModule],
    providers: [UsersService, PermissionsService],
    exports: [PermissionsService]
})
export class PermissionsModule {
}
