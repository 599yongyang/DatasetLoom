import { NextResponse } from 'next/server';
import { getDocumentByIds } from '@/lib/db/documents';
import { chunker } from '@/lib/chunker';
import path from 'path';
import { saveChunks } from '@/lib/db/chunks';
import { type Chunks } from '@prisma/client';
import getLabelPrompt from '@/lib/llm/prompts/label';
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
import cache, { generateChunkConfigHash } from '@/lib/utils/cache';

/**
 * 文档分块
 */
export const POST = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    const { projectId } = context;

    const body = await request.json();
    const { fileIds, strategy, separators, chunkSize, chunkOverlap } = body;

    const chunkConfigHash = generateChunkConfigHash({ fileIds, strategy, separators, chunkSize, chunkOverlap });
    const cachedChunks = cache.get(`preview-chunks:${projectId}:${chunkConfigHash}`);
    if (cachedChunks && cachedChunks.length > 0) {
        return NextResponse.json({ success: true, chunkList: cachedChunks, hash: chunkConfigHash });
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
        data.map((text, index) => {
            const chunkId = `${path.basename(doc.fileName, path.extname(doc.fileName))}-chunk-${index + 1}`;
            chunkList.push({
                id: nanoid(),
                projectId,
                name: chunkId,
                documentId: doc.id,
                documentName: doc.fileName,
                content: text.pageContent,
                size: text.pageContent.length
            } as Chunks);
        });
    }
    cache.set(`preview-chunks:${projectId}:${chunkConfigHash}`, chunkList);
    return NextResponse.json({ success: true, chunkList: chunkList, hash: chunkConfigHash });
});

export const PUT = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    const { projectId } = context;

    try {
        const body = await request.json();
        const { chunkConfigHash, modelConfigId, language } = body;

        // 参数验证
        if (!chunkConfigHash || !modelConfigId || !language) {
            return NextResponse.json(
                { error: '缺少必要参数: chunkConfigHash, modelConfigId 或 language' },
                { status: 400 }
            );
        }

        // 获取缓存数据
        const cacheKey = `preview-chunks:${projectId}:${chunkConfigHash}`;
        const cachedChunks = cache.get(cacheKey);
        if (!cachedChunks || !Array.isArray(cachedChunks)) {
            return NextResponse.json({ error: '缓存数据无效或已过期，请重新上传操作' }, { status: 400 });
        }

        // 获取模型配置
        const model = await getModelConfigById(modelConfigId);
        if (!model) {
            return NextResponse.json({ error: '指定的模型配置不存在' }, { status: 404 });
        }

        // 获取项目数据
        const projectData = await getProject(projectId);
        if (!projectData) {
            return NextResponse.json({ error: '项目数据获取失败' }, { status: 404 });
        }

        // 处理分块数据
        await processChunks({
            chunks: cachedChunks,
            model,
            language,
            globalPrompt: projectData.globalPrompt,
            domainTreePrompt: projectData.domainTreePrompt,
            projectId
        });

        return NextResponse.json({
            success: true,
            data: {
                processedCount: cachedChunks.length
            }
        });
    } catch (error) {
        console.error('处理分块时发生错误:', error);
        return NextResponse.json(
            { error: '服务器内部错误', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
});

interface ProcessChunksOptions {
    chunks: Chunks[];
    model: ModelConfigWithProvider;
    language: Language;
    globalPrompt?: string;
    domainTreePrompt?: string;
    projectId: string;
    batchSize?: number;
    retryCount?: number;
}

export async function processChunks(options: ProcessChunksOptions) {
    const {
        chunks,
        model,
        language,
        globalPrompt,
        domainTreePrompt,
        projectId,
        batchSize = 5,
        retryCount = 2
    } = options;

    const llmClient = new LLMClient(model);
    const totalChunks = chunks.length;
    let processedCount = 0;
    let failedCount = 0;
    const failedChunks: string[] = [];

    // 进度报告函数
    const reportProgress = () => {
        console.log(`处理进度: ${processedCount}/${totalChunks} (失败: ${failedCount})`);
    };

    for (let i = 0; i < totalChunks; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const batchPromises = batch.map(async (chunk, index) => {
            let attempt = 0;
            let lastError: Error | null = null;

            while (attempt <= retryCount) {
                try {
                    const prompt = getLabelPrompt({
                        text: chunk.content,
                        language,
                        globalPrompt,
                        domainTreePrompt
                    });

                    const { text } = await llmClient.chat(prompt);
                    const llmOutput = await doubleCheckModelOutput(text, documentAnalysisSchema);

                    const chunkData = {
                        id: chunk.id,
                        name: chunk.name,
                        projectId,
                        documentId: chunk.documentId,
                        documentName: chunk.documentName,
                        content: chunk.content,
                        size: chunk.size,
                        summary: llmOutput.summary,
                        domain: llmOutput.domain,
                        subDomain: llmOutput.subDomain,
                        tags: Array.isArray(llmOutput.tags) ? llmOutput.tags.join(',') : '',
                        language
                    } as Chunks;

                    // 使用事务处理保存操作
                    await saveChunks([chunkData]);
                    if (llmOutput.entities && llmOutput.relations) {
                        await insertChunkGraph(chunk.id, llmOutput.entities, llmOutput.relations);
                    }

                    processedCount++;
                    reportProgress();
                    return chunkData;
                } catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));
                    attempt++;

                    if (attempt <= retryCount) {
                        // 指数退避重试
                        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
                        continue;
                    }

                    console.error(`处理分块 ${chunk.id} 失败:`, lastError.message);
                    failedCount++;
                    failedChunks.push(chunk.id);
                    return null;
                }
            }
        });

        // 等待当前批次完成
        await Promise.all(batchPromises);
    }

    if (failedCount > 0) {
        console.warn(`处理完成，但有 ${failedCount} 个分块处理失败。失败的ID:`, failedChunks);
    } else {
        console.log('所有分块处理成功完成');
    }
}
