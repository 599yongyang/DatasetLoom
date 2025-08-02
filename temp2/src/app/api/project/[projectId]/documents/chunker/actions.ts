import type { Chunks } from '@prisma/client';
import type { ModelConfigWithProvider } from '@/lib/ai/core/types';
import type { Language } from '@/lib/ai/prompts/type';
import ModelClient from '@/lib/ai/core';
import { doubleCheckModelOutput } from '@/lib/utils';
import { documentAnalysisSchema } from '@/lib/ai/prompts/schema';
import { updateChunkById } from '@/server/db/chunks';
import getLabelPrompt from '@/lib/ai/prompts/label';
import { insertChunkGraph } from '@/server/db/chunk-graph';

interface ProcessChunksOptions {
    chunkId: string;
    context: string;
    model: ModelConfigWithProvider;
    language: Language;
    globalPrompt?: string;
    domainTreePrompt?: string;
    projectId: string;
}

//处理分块主入口
export async function processChunks(options: ProcessChunksOptions) {
    const { chunkId, context, model, language, globalPrompt, domainTreePrompt, projectId } = options;

    try {
        // 1. 构建提示并检查token长度
        const prompt = getLabelPrompt({
            text: context,
            language,
            globalPrompt,
            domainTreePrompt
        });

        // 2. 调用大模型
        const modelClient = new ModelClient(model);
        const { text } = await modelClient.chat(prompt);
        // console.debug('模型响应:', text);

        // 3. 验证和解析输出
        const modelOutput = await doubleCheckModelOutput(text, documentAnalysisSchema);
        // console.debug('解析后的输出:', modelOutput);
        const chunk = {
            id: chunkId,
            projectId,
            summary: modelOutput.summary,
            domain: modelOutput.domain,
            subDomain: modelOutput.subDomain,
            tags: Array.isArray(modelOutput.tags) ? modelOutput.tags.join(',') : '',
            language
        } as Chunks;

        // 5. 保存结果
        await updateChunkById(chunkId, chunk);
        if (modelOutput.entities && modelOutput.relations) {
            return insertChunkGraph(chunkId, modelOutput.entities, modelOutput.relations);
        }
    } catch (error) {
        console.error('处理分块时出错:', error);
        throw error;
    }
}
