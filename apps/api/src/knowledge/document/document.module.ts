import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { ParserConfigService } from '@/setting/parser-config/parser-config.service';
import { DocumentGraphService } from '@/knowledge/document/document-graph.service';
import { ModelConfigService } from '@/setting/model-config/model-config.service';
import { TagRelGenerator } from '@/knowledge/document/generators/tag-rel.generator';
import { PromptTemplateService } from '@/setting/prompt-template/prompt-template.service';
import { RagModule } from '@/common/rag/rag.module';

@Module({
    imports: [PrismaModule, RagModule],
    controllers: [DocumentController],
    providers: [DocumentService, ParserConfigService, DocumentGraphService, ModelConfigService, TagRelGenerator, PromptTemplateService]
})
export class DocumentModule {
}
