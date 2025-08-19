import { Module } from '@nestjs/common';
import { QdrantService } from './serivce/qdrant.service';
import { RagService } from '@/common/rag/rag.service';
import { RerankerService } from '@/common/rag/serivce/reranker.service';
import { ModelConfigService } from '@/setting/model-config/model-config.service';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [QdrantService, RagService, RerankerService, ModelConfigService],
    exports: [QdrantService, RagService, RerankerService]
})
export class RagModule {
}
