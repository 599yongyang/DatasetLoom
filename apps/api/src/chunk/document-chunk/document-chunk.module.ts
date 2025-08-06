import {Module} from '@nestjs/common';
import {DocumentChunkService} from './document-chunk.service';
import {DocumentChunkController} from './document-chunk.controller';
import {PrismaModule} from '@/common/prisma/prisma.module';
import {ModelConfigService} from '@/setting/model-config/model-config.service';
import {QuestionService} from '@/question/question.service';
import {ProjectService} from '@/project/project.service';
import {AIModule} from "@/common/ai/ai.module";
import {DocumentService} from "@/knowledge/document/document.service";
import {CacheModule} from "@nestjs/cache-manager";
import {TagRelGenerator} from "@/chunk/document-chunk/generators/tag-rel.generator";
import {DocumentChunkGraphService} from "@/chunk/document-chunk/document-chunk-graph.service";

@Module({
    imports: [PrismaModule, AIModule,CacheModule.register()],
    controllers: [DocumentChunkController],
    providers: [DocumentChunkService, ModelConfigService, QuestionService, ProjectService, DocumentService,TagRelGenerator, DocumentChunkGraphService],
})
export class DocumentChunkModule {
}
