import {Module} from '@nestjs/common';
import {ImageChunkService} from './image-chunk.service';
import {ImageChunkController} from './image-chunk.controller';
import {PrismaModule} from "@/common/prisma/prisma.module";
import {ImagesService} from "@/knowledge/images/images.service";
import {ModelConfigService} from "@/setting/model-config/model-config.service";

@Module({
    imports: [PrismaModule],
    controllers: [ImageChunkController],
    providers: [ImageChunkService, ImagesService, ModelConfigService],
})
export class ImageChunkModule {
}
