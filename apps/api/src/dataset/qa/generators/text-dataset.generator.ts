import { Injectable } from '@nestjs/common';
import { ModelConfigWithProvider, QuestionsWithDatasetSample } from '@/common/prisma/type';
import { doubleCheckModelOutput } from '@/utils/model.util';
import { AIService } from '@/common/ai/ai.service';
import { answerSchema } from '@/common/ai/prompts/schema';
import { PromptTemplateService } from '@/setting/prompt-template/prompt-template.service';
import Handlebars from 'handlebars';
import { answerSystemPrompt } from '@/common/ai/prompts/system';
import { AiGenDto } from '@/common/dto/ai-gen.dto';

@Injectable()
export class TextDatasetGenerator {
    constructor(
        private readonly aiService: AIService,
        private readonly promptTemplateService: PromptTemplateService
    ) {
    }

    async generate(createQaDto: AiGenDto, model: ModelConfigWithProvider, question: QuestionsWithDatasetSample) {
        if (!createQaDto.templateId) throw new Error('templateId not found');
        const promptTemplate = await this.promptTemplateService.getInfoById(createQaDto.templateId, createQaDto.projectId);
        if (!promptTemplate) throw new Error('promptTemplate not found');


        const template = Handlebars.compile(promptTemplate.content);
        const prompt = template({
            ...createQaDto.variablesData,
            context: question.contextData,
            question: question.question
        });


        const { text, reasoning } = await this.aiService.chat(model, prompt, answerSystemPrompt);
        const modelOutput = await doubleCheckModelOutput(text, answerSchema);

        return {
            projectId: createQaDto.projectId,
            question: question.question,
            answer: modelOutput.answer,
            model: createQaDto.modelName,
            cot: reasoning ?? '',
            referenceLabel: question.label || '',
            evidence: modelOutput.evidence ? JSON.stringify(modelOutput.evidence) : '',
            confidence: modelOutput.confidence,
            questionId: question.id,
            isPrimaryAnswer: question.DatasetSamples.length <= 0
        };
    }
}
