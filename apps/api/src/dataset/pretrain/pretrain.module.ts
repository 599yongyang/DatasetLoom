import { Module } from '@nestjs/common';
import { PretrainService } from './pretrain.service';
import { PretrainController } from './pretrain.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PretrainController],
    providers: [PretrainService]
})
export class PretrainModule {
}
