import {Injectable} from '@nestjs/common';
import {ModelConfigWithProvider} from '@/common/prisma/type';
import {DatasetSampleWithQuestion} from '@/common/prisma/type';
import {ContextType} from '@/common/prisma/enum';
import {ImagesService} from '@/knowledge/images/images.service';
import {doubleCheckModelOutput} from '@/utils/model.util';
import {readFileSync} from 'fs';
import {AIService} from "@/common/ai/ai.service";
import {getAIScoringPrompt} from "@/common/ai/prompts/ai-score";
import {aiScoreSchema} from "@/common/ai/prompts/schema";

@Injectable()
export class EvaluationGenerator {
    constructor(
        private readonly aiService: AIService,
        private readonly imagesService: ImagesService,
    ) {
    }

    async generateAIScore(dss: DatasetSampleWithQuestion, modelConfig: ModelConfigWithProvider) {
        // 准备prompt
        const contextData = dss.questions.contextType === ContextType.IMAGE
            ? undefined
            : dss.questions.contextData;

        const prompt = getAIScoringPrompt(
            contextData,
            dss.questions.realQuestion,
            dss.answer
        );

        // 根据内容类型处理
        if (dss.questions.contextType === ContextType.IMAGE) {
            return await this.generateImageAIScore(modelConfig, dss.questions.contextId, prompt);
        } else {
            return await this.generateTextAIScore(modelConfig, prompt);
        }
    }

    private async generateImageAIScore(modelConfig: ModelConfigWithProvider, contextId: string, prompt: string) {
        const imageFile = await this.imagesService.getInfoById(contextId);
        if (!imageFile) {
            throw new Error('Image file not found');
        }

        const buffer = readFileSync(imageFile.url);
        const {text} = await this.aiService.vision(modelConfig, buffer, prompt);
        return await doubleCheckModelOutput(text, aiScoreSchema);
    }

    private async generateTextAIScore(modelConfig: ModelConfigWithProvider, prompt: string) {
        const {text} = await this.aiService.chat(modelConfig, prompt);
        return await doubleCheckModelOutput(text, aiScoreSchema);
    }
}
