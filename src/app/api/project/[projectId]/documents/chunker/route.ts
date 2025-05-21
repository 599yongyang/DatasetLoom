import { NextResponse } from 'next/server';
import { getProject } from '@/lib/db/projects';
import { getDocumentByIds } from '@/lib/db/documents';
import { chunker } from '@/lib/chunker';
import path from 'path';
import { saveChunks } from '@/lib/db/chunks';
import { type Chunks } from '@prisma/client';
import getLabelPrompt from '@/lib/llm/prompts/label';
import LLMClient from '@/lib/llm/core';
import { insertChunkMetadata } from '@/lib/db/chunk-metadata';
import { nanoid } from 'nanoid';
import { documentAnalysisSchema } from '@/lib/llm/prompts/schema';
import { doubleCheckModelOutput } from '@/lib/utils';
import { insertChunkGraph } from '@/lib/db/chunk-graph';

type Params = Promise<{ projectId: string }>;

// chunker
export async function POST(request: Request, props: { params: Params }) {
    const params = await props.params;
    const { projectId } = params;

    // 验证项目ID
    if (!projectId) {
        console.log('The project ID cannot be empty, returning 400 error');
        return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
    }

    // 获取项目信息
    const project = await getProject(projectId);
    if (!project) {
        console.log('The project does not exist, returning 404 error');
        return NextResponse.json({ error: 'The project does not exist' }, { status: 404 });
    }

    const body = await request.json();
    const { fileIds, strategy, separators, chunkSize, chunkOverlap, model, language } = body;

    const docs = await getDocumentByIds(fileIds);

    //将文件内容进行分块
    let chunkList: Chunks[] = [];
    for (const doc of docs) {
        const data = await chunker(doc.path, strategy, { chunkSize, chunkOverlap, separators });
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
    //将chunk给大模型打标签
    queueMicrotask(() => {
        processChunks(chunkRes, language, model).catch(console.error);
    });

    return NextResponse.json({ success: true, count: chunkRes.length });
}

export async function processChunks(chunkRes: Chunks[], language: string, model: object) {
    const llmClient = new LLMClient(model);
    const batchSize = 5; // 控制并发数量

    for (let i = 0; i < chunkRes.length; i += batchSize) {
        const batch = chunkRes.slice(i, i + batchSize);

        const promises = batch.map(async chunk => {
            try {
                const promptFunc = getLabelPrompt;
                const prompt = promptFunc({ text: chunk.content });
                const response = await llmClient.chat(prompt);
                const llmOutput = await doubleCheckModelOutput(response, documentAnalysisSchema);
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
                console.log(llmOutput, 'llmOutput');
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
