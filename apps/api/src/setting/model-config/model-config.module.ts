import { Module } from '@nestjs/common';
import { ModelConfigService } from './model-config.service';
import { ModelConfigController } from './model-config.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { ProjectService } from '@/project/project.service';

@Module({
    imports: [PrismaModule],
    controllers: [ModelConfigController],
    providers: [ModelConfigService, ProjectService]
})
export class ModelConfigModule {
}
