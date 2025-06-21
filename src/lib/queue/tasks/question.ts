import type { Chunks, Questions } from '@prisma/client';
import { getQuestionPrompt } from '@/lib/llm/prompts/question';
import { questionsSchema } from '@/lib/llm/prompts/schema';
import { doubleCheckModelOutput } from '@/lib/utils';
import { saveQuestions } from '@/lib/db/questions';
import LLMClient from '@/lib/llm/core';
import { getModelConfigById } from '@/lib/db/model-config';
import { nanoid } from 'nanoid';
import { getChunkByIds } from '@/lib/db/chunks';
import type { ModelConfigWithProvider } from '@/lib/llm/core/types';
import type { TaskParams, TaskResult } from '@/lib/queue/types';

export async function questionTask(params: TaskParams): Promise<TaskResult> {
    const { step, inputs, projectId } = params;
    const startedAt = new Date();
    try {
        if (!step.data || !step.data.modelConfigId) {
            throw new Error('Missing question data');
        }

        console.log(`【${step.name}】【STEP_ID:${step.id}] 节点开始运行 @ ${startedAt.toLocaleString()}`);

        if (!inputs.chunker) {
            throw new Error('Missing input chunker data');
        }

        const chunkerIds = inputs.chunker.map((chunker: Chunks) => {
            return chunker.id;
        });

        const chunks = await getChunkByIds(chunkerIds);

        const model = await getModelConfigById(step.data.modelConfigId as string);
        const llmClient = new LLMClient({ ...model, ...step.data } as ModelConfigWithProvider);
        let questionList: Questions[] = [];
        for (const chunk of chunks) {
            const prompt = getQuestionPrompt({
                text: chunk.content,
                tags: chunk.ChunkMetadata?.tags || '',
                number: step.data.questionCountType === 'auto' ? undefined : (step.data.questionCount as number)
            });
            const { text } = await llmClient.chat(prompt);
            const llmOutput = await doubleCheckModelOutput(text, questionsSchema);
            const questions = llmOutput.map(question => {
                return {
                    question: question.question,
                    label: question.label.join(','),
                    projectId,
                    chunkId: chunk.id,
                    id: nanoid()
                } as Questions;
            });
            // 保存问题到数据库
            await saveQuestions(questions as Questions[]);
            questionList.push(...questions);
        }
        return {
            success: true,
            data: questionList,
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
