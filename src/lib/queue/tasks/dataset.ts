// import type { DatasetSamples, Questions } from '@prisma/client';
// import { getQuestionsByIds } from '@/server/db/questions';
// import LLMClient from '@/lib/ai/core';
// import { getModelConfigById } from '@/server/db/model-config';
// import { getAnswerPrompt } from '@/lib/ai/prompts/answer';
// import { nanoid } from 'nanoid';
// import { createDatasetSample } from '@/server/db/dataset-samples';
// import { doubleCheckModelOutput } from '@/lib/utils';
// import { answerSchema } from '@/lib/ai/prompts/schema';
// import { getChunkById } from '@/server/db/chunks';
// import type { TaskParams, TaskResult } from '@/lib/queue/types';
//
// export async function datasetTask(params: TaskParams): Promise<TaskResult> {
//     const { step, inputs, projectId } = params;
//     const startedAt = new Date();
//     try {
//         if (!step.data || !step.data.modelConfigId) {
//             throw new Error('Missing dataset data');
//         }
//
//         console.log(`【${step.name}】【STEP_ID:${step.id}] 节点开始运行 @ ${startedAt.toLocaleString()}`);
//
//         if (!inputs.question) {
//             throw new Error('Missing input question data');
//         }
//
//         const model = await getModelConfigById(step.data.modelConfigId as string);
//         if (!model) {
//             throw new Error(' model config not found');
//         }
//         const llmClient = new LLMClient({ ...model, ...step.data });
//
//         const ids = inputs.question.map((item: Questions) => {
//             return item.id;
//         });
//         const questionList = await getQuestionsByIds(projectId, ids);
//         const datasetList = [];
//         for (const question of questionList) {
//             // 获取文本块内容
//             const chunk = await getChunkById(question.chunkId);
//             let allTags: string[] = [];
//             if (chunk) {
//                 const qTags = question.label?.split(',') ?? [];
//                 const cTags = chunk.tags?.split(',') ?? [];
//                 allTags = [...new Set([...qTags, ...cTags])]; // 合并并去重
//             }
//
//             // 生成答案的提示词
//             const prompt = getAnswerPrompt({
//                 context: question.chunk.content,
//                 question: question.question
//             });
//             // 调用大模型生成答案
//             const { text, reasoning } = await llmClient.chat(prompt);
//             const llmOutput = await doubleCheckModelOutput(text, answerSchema);
//             // 创建新的数据集项
//             const datasets = {
//                 id: nanoid(12),
//                 projectId: projectId,
//                 question: question.question,
//                 answer: llmOutput.answer,
//                 model: model.modelName,
//                 cot: reasoning ?? '',
//                 referenceLabel: allTags.join(',') || '',
//                 evidence: JSON.stringify(llmOutput.evidence),
//                 confidence: llmOutput.confidence,
//                 chunkName: chunk ? chunk.name : question.chunk.name,
//                 chunkContent: chunk ? chunk.content : question.chunk.content,
//                 questionId: question.id
//             };
//
//             await createDatasetSample(datasets as DatasetSamples);
//             datasetList.push(datasets);
//         }
//
//         return {
//             success: true,
//             data: datasetList,
//             startedAt,
//             finishedAt: new Date(),
//             stepName: step.name,
//             stepId: step.id
//         };
//     } catch (error) {
//         console.error(`【${step.name}】执行失败`, error);
//         return {
//             success: false,
//             error: error instanceof Error ? error.message : String(error),
//             startedAt,
//             finishedAt: new Date(),
//             stepName: step.name,
//             stepId: step.id
//         };
//     }
// }
