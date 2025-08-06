import {Module} from '@nestjs/common';
import {ChatService} from './chat.service';
import {ChatController} from './chat.controller';
import {PrismaModule} from "@/common/prisma/prisma.module";
import {ModelConfigService} from "@/setting/model-config/model-config.service";

@Module({
    imports: [PrismaModule],
    controllers: [ChatController],
    providers: [ChatService, ModelConfigService],
})
export class ChatModule {
}
