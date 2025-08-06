import {Module} from '@nestjs/common';
import {DocumentService} from './document.service';
import {DocumentController} from './document.controller';
import {PrismaModule} from '@/common/prisma/prisma.module';
import {ParserConfigService} from "@/setting/parser-config/parser-config.service";
import {DocumentChunkGraphService} from "@/chunk/document-chunk/document-chunk-graph.service";

@Module({
    imports: [PrismaModule],
    controllers: [DocumentController],
    providers: [DocumentService, ParserConfigService, DocumentChunkGraphService],
})
export class DocumentModule {
}
