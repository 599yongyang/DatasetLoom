import { Module } from '@nestjs/common';
import { QaDatasetService } from './qa-dataset.service';
import { QADatasetController } from '@/dataset/qa/qa-dataset.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { QuestionService } from '@/question/question.service';
import { ProjectService } from '@/project/project.service';
import { ImagesService } from '@/knowledge/images/images.service';
import { ModelConfigService } from '@/setting/model-config/model-config.service';
import { ExportDatasetService } from '@/dataset/qa/export-dataset.service';
import { ImageDatasetGenerator } from '@/dataset/qa/generators/image-dataset.generator';
import { TextDatasetGenerator } from '@/dataset/qa/generators/text-dataset.generator';
import { EvaluationGenerator } from '@/dataset/qa/generators/evaluation.generator';
import { PromptTemplateService } from '@/setting/prompt-template/prompt-template.service';

@Module({
    imports: [PrismaModule],
    controllers: [QADatasetController],
    providers: [QaDatasetService, QuestionService, ProjectService, PromptTemplateService, ImagesService, ModelConfigService, ExportDatasetService, TextDatasetGenerator, ImageDatasetGenerator, EvaluationGenerator]
})
export class QaDatasetModule {
}
