import {Module, Global} from '@nestjs/common';
import {AIService} from './ai.service';
import {ModelUsageService} from "@/model-usage/model-usage.service";
import {PrismaModule} from "@/common/prisma/prisma.module";
import {AIProviderFactory} from "@/common/ai/factories/ai-provider.factory";
import {ChatService} from "@/chat/chat.service";

@Global()
@Module({
    imports: [PrismaModule],
    providers: [AIService, ModelUsageService, AIProviderFactory, ChatService],
    exports: [AIService, ModelUsageService, AIProviderFactory, ChatService],
})
export class AIModule {
}
