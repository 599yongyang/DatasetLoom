import { Module } from '@nestjs/common';
import { ProjectMemberService } from './project-member.service';
import { ProjectMemberController } from './project-member.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { UsersService } from '@/users/users.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [PrismaModule, CacheModule.register()],
    controllers: [ProjectMemberController],
    providers: [ProjectMemberService, UsersService]
})
export class ProjectMemberModule {
}
