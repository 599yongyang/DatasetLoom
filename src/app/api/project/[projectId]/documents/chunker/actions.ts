import type { Chunks } from '@prisma/client';
import type { ModelConfigWithProvider } from '@/lib/ai/core/types';
import type { Language } from '@/lib/ai/prompts/type';
import LLMClient from '@/lib/ai/core';
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

        // 2. 调用LLM
        const llmClient = new LLMClient(model);
        const { text } = await llmClient.chat(prompt);
        // console.debug('LLM响应:', text);

        // 3. 验证和解析输出
        const llmOutput = await doubleCheckModelOutput(text, documentAnalysisSchema);
        // console.debug('解析后的输出:', llmOutput);
        const chunk = {
            id: chunkId,
            projectId,
            summary: llmOutput.summary,
            domain: llmOutput.domain,
            subDomain: llmOutput.subDomain,
            tags: Array.isArray(llmOutput.tags) ? llmOutput.tags.join(',') : '',
            language
        } as Chunks;

        // 5. 保存结果
        await updateChunkById(chunkId, chunk);
        if (llmOutput.entities && llmOutput.relations) {
            return insertChunkGraph(chunkId, llmOutput.entities, llmOutput.relations);
        }
    } catch (error) {
        console.error('处理分块时出错:', error);
        throw error;
    }
}
