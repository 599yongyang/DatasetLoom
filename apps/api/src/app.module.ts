import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {UsersModule} from '@/users/users.module';
import {AuthModule} from './auth/auth.module';
import {ConfigModule} from '@nestjs/config';
import {ProjectModule} from './project/project.module';
import {ModelConfigModule} from '@/setting/model-config/model-config.module';
import {ProvidersModule} from '@/setting/providers/providers.module';
import {ImagesModule} from '@/knowledge/images/images.module';
import {DocumentChunkModule} from '@/chunk/document-chunk/document-chunk.module';
import {QuestionModule} from './question/question.module';
import {QaDatasetModule} from '@/dataset/qa/qa-dataset.module';
import {ProjectMemberModule} from '@/setting/project-member/project-member.module';
import {ParserConfigModule} from '@/setting/parser-config/parser-config.module';
import {ImageChunkModule} from '@/chunk/image-chunk/image-chunk.module';
import {DocumentModule} from "@/knowledge/document/document.module";
import {CacheModule} from '@nestjs/cache-manager';
import {DashboardModule} from './dashboard/dashboard.module';
import {ChatModule} from './chat/chat.module';
import { PromptTemplateModule } from '@/setting/prompt-template/prompt-template.module';

@Module({
    imports: [CacheModule.register(), UsersModule, AuthModule, ConfigModule.forRoot({
        envFilePath: '../../.env',
        isGlobal: true
    }), DocumentChunkModule, ProjectModule, ModelConfigModule, ProvidersModule, DocumentModule, ImagesModule, QuestionModule, QaDatasetModule, ProjectMemberModule, ParserConfigModule, ImageChunkModule, DashboardModule, ChatModule, PromptTemplateModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
