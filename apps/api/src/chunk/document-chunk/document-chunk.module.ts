import { Module } from '@nestjs/common';
import { DocumentChunkService } from './document-chunk.service';
import { DocumentChunkController } from './document-chunk.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { ModelConfigService } from '@/setting/model-config/model-config.service';
import { QuestionService } from '@/question/question.service';
import { AIModule } from '@/common/ai/ai.module';
import { DocumentService } from '@/knowledge/document/document.service';
import { PromptTemplateService } from '@/setting/prompt-template/prompt-template.service';
import { RagModule } from '@/common/rag/rag.module';

@Module({
    imports: [PrismaModule, AIModule, RagModule],
    controllers: [DocumentChunkController],
    providers: [DocumentChunkService, ModelConfigService, QuestionService, PromptTemplateService, DocumentService]
})
export class DocumentChunkModule {
}
