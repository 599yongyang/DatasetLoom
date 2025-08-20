import { Module } from '@nestjs/common';
import { QdrantService } from './serivce/qdrant.service';
import { RagService } from '@/common/rag/rag.service';
import { RerankerService } from '@/common/rag/serivce/reranker.service';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { ChunkerService } from '@/common/rag/serivce/chunker.service';

@Module({
    imports: [PrismaModule],
    providers: [QdrantService, RagService, RerankerService, ChunkerService],
    exports: [QdrantService, RagService, RerankerService, ChunkerService]
})
export class RagModule {
}
