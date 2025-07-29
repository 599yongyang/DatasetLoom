import type { DatasetSamples } from '@prisma/client';
import type { DatasetStrategyParams } from '@/types/dataset';
import type ModelClient from '@/lib/ai/core';
import { getProject } from '@/server/db/projects';
import { getAnswerPrompt } from '@/lib/ai/prompts/answer';
import type { AnswerStyle, DetailLevel, Language } from '@/lib/ai/prompts/type';
import { doubleCheckModelOutput } from '@/lib/utils';
import { answerSchema } from '@/lib/ai/prompts/schema';
import { genImageAnswerPrompt } from '@/lib/ai/prompts/vision';
import { getImageFileById } from '@/server/db/image-file';
import { readFileSync } from 'fs';
import type { QuestionsDTO } from '@/server/db/schema/questions';

export async function generateTextDatasetSample(
    question: QuestionsDTO,
    params: DatasetStrategyParams,
    modelClient: ModelClient,
    projectId: string,
    modelName: string
): Promise<Partial<DatasetSamples>> {
    const project = await getProject(projectId);
    if (!project) throw new Error('Project not found');

    const prompt = getAnswerPrompt({
        context: question.contextData,
        question: question.question,
        detailLevel: params.detailLevel as DetailLevel,
        citation: params.citation,
        answerStyle: params.answerStyle as AnswerStyle,
        tags: question.label?.split(',') ?? [],
        language: params.language as Language,
        globalPrompt: project.globalPrompt,
        answerPrompt: project.answerPrompt
    });

    const { text, reasoning } = await modelClient.chat(prompt);
    const modelOutput = await doubleCheckModelOutput(text, answerSchema);

    return {
        projectId,
        question: question.question,
        answer: modelOutput.answer,
        model: modelName,
        cot: reasoning ?? '',
        referenceLabel: question.label || '',
        evidence: modelOutput.evidence ? JSON.stringify(modelOutput.evidence) : '',
        confidence: modelOutput.confidence,
        questionId: question.id,
        isPrimaryAnswer: question.DatasetSamples.length <= 0
    };
}

export async function generateImageDatasetSample(
    question: QuestionsDTO,
    params: DatasetStrategyParams,
    modelClient: ModelClient,
    projectId: string,
    modelName: string
): Promise<Partial<DatasetSamples>> {
    const prompt = genImageAnswerPrompt(question.realQuestion, question.contextData, params.language);

    const imageFile = await getImageFileById(question.contextId);
    if (!imageFile) throw new Error('Image file not found');

    const buffer: Buffer = readFileSync(imageFile.url);
    const { text } = await modelClient.vision(buffer, prompt);
    console.log(text, 'modelRes');
    const modelOutput = await doubleCheckModelOutput(text, answerSchema);

    return {
        projectId,
        question: question.question,
        answer: modelOutput.answer,
        model: modelName,
        cot: '',
        referenceLabel: question.label || '',
        evidence: modelOutput.evidence ? JSON.stringify(modelOutput.evidence) : '',
        confidence: modelOutput.confidence,
        questionId: question.id,
        isPrimaryAnswer: question.DatasetSamples.length <= 0
    };
}
