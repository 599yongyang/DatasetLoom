import type { TaskParams, TaskResult } from '@/lib/queue';
import type { Datasets, Questions } from '@prisma/client';
import { getQuestionsByIds } from '@/lib/db/questions';
import LLMClient from '@/lib/llm/core';
import { getModelConfigById } from '@/lib/db/model-config';
import getAnswerPrompt from '@/lib/llm/prompts/answer';
import { nanoid } from 'nanoid';
import { createDataset } from '@/lib/db/datasets';

export async function datasetTask(params: TaskParams): Promise<TaskResult> {
    const { step, inputs, projectId } = params;
    const startedAt = new Date();
    try {
        if (!step.data || !step.data.modelConfigId) {
            throw new Error('Missing dataset data');
        }

        console.log(`【${step.name}】【STEP_ID:${step.id}] 节点开始运行 @ ${startedAt.toLocaleString()}`);

        if (!inputs.question) {
            throw new Error('Missing input question data');
        }

        const model = await getModelConfigById(step.data.modelConfigId as string);
        if (!model) {
            throw new Error(' model config not found');
        }
        const llmClient = new LLMClient({ ...model, ...step.data });

        const ids = inputs.question.map((item: Questions) => {
            return item.id;
        });
        const questionList = await getQuestionsByIds(projectId, ids);
        const datasetList = [];
        for (const question of questionList) {
            // 生成答案的提示词
            const prompt = getAnswerPrompt({
                text: question.chunk.content,
                question: question.question
            });
            // 调用大模型生成答案
            const { text, reasoning } = await llmClient.chat(prompt, 'textAndReasoning');
            // 创建新的数据集项
            const datasets = {
                id: nanoid(12),
                projectId: projectId,
                question: question.question,
                answer: text,
                model: model.modelName,
                cot: reasoning,
                questionLabel: question.label || null,
                chunkName: question.chunk.name,
                chunkContent: question.chunk.content,
                questionId: question.id
            };

            await createDataset(datasets as Datasets);
            datasetList.push(datasets);
        }

        return {
            success: true,
            data: datasetList,
            startedAt,
            finishedAt: new Date(),
            stepName: step.name,
            stepId: step.id
        };
    } catch (error) {
        console.error(`【${step.name}】执行失败`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            startedAt,
            finishedAt: new Date(),
            stepName: step.name,
            stepId: step.id
        };
    }
}
