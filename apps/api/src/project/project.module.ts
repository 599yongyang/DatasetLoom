import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { QdrantService } from '@/common/rag/serivce/qdrant.service';
import { ModelConfigService } from '@/setting/model-config/model-config.service';
import { PermissionsModule } from '@/common/permissions/permissions.module';

@Module({
    imports: [PrismaModule, PermissionsModule],
    controllers: [ProjectController],
    providers: [ProjectService, QdrantService, ModelConfigService]
})
export class ProjectModule {
}
