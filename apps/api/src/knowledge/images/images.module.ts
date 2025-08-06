import {Module} from '@nestjs/common';
import {ImagesService} from './images.service';
import {ImagesController} from './images.controller';
import {PrismaModule} from '@/common/prisma/prisma.module';
import {ModelConfigService} from "@/setting/model-config/model-config.service";
import {AIService} from "@/common/ai/ai.service";

@Module({
    imports: [PrismaModule],
    controllers: [ImagesController],
    providers: [ImagesService, AIService, ModelConfigService],
})
export class ImagesModule {
}
