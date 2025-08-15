import { Injectable } from '@nestjs/common';
import { ModelConfigWithProvider, QuestionsWithDatasetSample } from '@/common/prisma/type';
import { doubleCheckModelOutput } from '@/utils/model.util';
import { ImagesService } from '@/knowledge/images/images.service';
import { readFileSync } from 'fs';
import { genImageAnswerPrompt } from '@/common/ai/prompts/vision';
import { AIService } from '@/common/ai/ai.service';
import { answerSchema } from '@/common/ai/prompts/schema';
import { AiGenDto } from '@/common/dto/ai-gen.dto';

@Injectable()
export class ImageDatasetGenerator {
    constructor(
        private readonly aiService: AIService,
        private readonly imagesService: ImagesService
    ) {
    }

    async generate(createQaDto: AiGenDto, model: ModelConfigWithProvider, question: QuestionsWithDatasetSample) {
        const prompt = genImageAnswerPrompt(question.realQuestion, question.contextData);

        const imageFile = await this.imagesService.getInfoById(question.contextId);
        if (!imageFile) throw new Error('Image file not found');

        const buffer: Buffer = readFileSync(imageFile.url);
        const { text } = await this.aiService.vision(model, buffer, prompt);
        console.log(text, 'modelRes');
        const modelOutput = await doubleCheckModelOutput(text, answerSchema);

        return {
            projectId: createQaDto.projectId,
            question: question.question,
            answer: modelOutput.answer,
            model: createQaDto.modelName,
            cot: '',
            referenceLabel: question.label || '',
            evidence: modelOutput.evidence ? JSON.stringify(modelOutput.evidence) : '',
            confidence: modelOutput.confidence,
            questionId: question.id,
            isPrimaryAnswer: question.DatasetSamples.length <= 0
        };
    }
}
