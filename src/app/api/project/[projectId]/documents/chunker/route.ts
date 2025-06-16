import { NextResponse } from 'next/server';
import { getDocumentByIds } from '@/lib/db/documents';
import { chunker } from '@/lib/chunker';
import path from 'path';
import { saveChunks } from '@/lib/db/chunks';
import { type Chunks } from '@prisma/client';
import getLabelPrompt from '@/lib/llm/prompts/label';
import { insertChunkMetadata } from '@/lib/db/chunk-metadata';
import { nanoid } from 'nanoid';
import { documentAnalysisSchema } from '@/lib/llm/prompts/schema';
import { doubleCheckModelOutput } from '@/lib/utils';
import { insertChunkGraph } from '@/lib/db/chunk-graph';
import type { Language } from '@/lib/llm/prompts/type';
import { getModelConfigById } from '@/lib/db/model-config';
import type { ModelConfigWithProvider } from '@/lib/llm/core/types';
import LLMClient from '@/lib/llm/core';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import { AuditLog } from '@/lib/middleware/audit-log';
import type { ApiContext } from '@/types/api-context';
import { getProject } from '@/lib/db/projects';

/**
 * 文档分块
 */
export const POST = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    const { projectId } = context;

    const body = await request.json();
    const { fileIds, strategy, separators, chunkSize, chunkOverlap, modelConfigId, language } = body;
    const model = await getModelConfigById(modelConfigId);
    if (!model) {
        return NextResponse.json({ error: 'Model not fount' }, { status: 400 });
    }
    const docs = await getDocumentByIds(fileIds);

    //将文件内容进行分块
    let chunkList: Chunks[] = [];
    for (const doc of docs) {
        const filePath = doc.parserFilePath || doc.path;
        if (!filePath) {
            continue;
        }
        const data = await chunker(filePath, strategy, { chunkSize, chunkOverlap, separators });
        chunkList = data.map((text, index) => {
            const chunkId = `${path.basename(doc.fileName, path.extname(doc.fileName))}-part-${index + 1}`;
            return {
                projectId,
                name: chunkId,
                fileId: doc.id,
                fileName: doc.fileName,
                content: text.pageContent,
                summary: text.pageContent,
                size: text.pageContent.length
            } as Chunks;
        });
    }

    //保存chunk
    let chunkRes = await saveChunks(chunkList as Chunks[]);

    const projectData = await getProject(projectId);

    //将chunk给大模型打标签
    queueMicrotask(() => {
        processChunks(chunkRes, model, language, projectData?.globalPrompt, projectData?.domainTreePrompt).catch(
            console.error
        );
    });

    return NextResponse.json({ success: true, count: chunkRes.length });
});

export async function processChunks(
    chunkRes: Chunks[],
    model: ModelConfigWithProvider,
    language: Language,
    globalPrompt?: string,
    domainTreePrompt?: string
) {
    const llmClient = new LLMClient(model);
    const batchSize = 5; // 控制并发数量

    for (let i = 0; i < chunkRes.length; i += batchSize) {
        const batch = chunkRes.slice(i, i + batchSize);

        const promises = batch.map(async chunk => {
            try {
                const prompt = getLabelPrompt({ text: chunk.content, language, globalPrompt, domainTreePrompt });
                const { text } = await llmClient.chat(prompt);
                const llmOutput = await doubleCheckModelOutput(text, documentAnalysisSchema);
                const metadata = {
                    id: nanoid(),
                    chunkId: chunk.id,
                    domain: llmOutput.domain,
                    subDomain: llmOutput.subDomain,
                    summary: llmOutput.summary,
                    tags: Array.isArray(llmOutput.tags) ? llmOutput.tags.join(',') : '',
                    language: language
                };
                await insertChunkMetadata([metadata]);
                if (llmOutput.entities && llmOutput.relations) {
                    await insertChunkGraph(chunk.id, llmOutput.entities, llmOutput.relations);
                }
                return metadata;
            } catch (error) {
                console.error(
                    `Error processing chunk ${chunk.id}:`,
                    error instanceof Error ? error.message : String(error)
                );
                return null;
            }
        });

        // 等待当前批次所有任务完成（即使有失败的也继续）
        const results = await Promise.allSettled(promises);
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Chunk at index ${i + index} failed:`, result.reason);
            }
        });
    }
}
