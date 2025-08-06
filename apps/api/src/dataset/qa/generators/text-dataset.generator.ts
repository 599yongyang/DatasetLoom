import { Injectable } from '@nestjs/common';
import { ModelConfigWithProvider, QuestionsWithDatasetSample } from '@/common/prisma/type';
import { CreateQaDatasetDto } from '../dto/create-qa-dataset.dto';
import { doubleCheckModelOutput } from '@/utils/model.util';
import { ProjectService } from '@/project/project.service';
import {getAnswerPrompt} from "@/common/ai/prompts/answer";
import {AIService} from "@/common/ai/ai.service";
import {answerSchema} from "@/common/ai/prompts/schema";

@Injectable()
export class TextDatasetGenerator {
    constructor(
        private readonly aiService: AIService,
        private readonly projectService: ProjectService,
    ) {}

    async generate(createQaDto: CreateQaDatasetDto, model: ModelConfigWithProvider, question: QuestionsWithDatasetSample) {
        const project = await this.projectService.getInfoById(createQaDto.projectId);
        if (!project) throw new Error('Project not found');

        const prompt = getAnswerPrompt({
            context: question.contextData,
            question: question.question,
            detailLevel: createQaDto.detailLevel,
            citation: createQaDto.citation,
            answerStyle: createQaDto.answerStyle,
            tags: question.label?.split(',') ?? [],
            language: createQaDto.language,
            globalPrompt: project.globalPrompt,
            answerPrompt: project.answerPrompt,
        });

        const { text, reasoning } = await this.aiService.chat(model, prompt);
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
            isPrimaryAnswer: question.DatasetSamples.length <= 0,
        };
    }
}
