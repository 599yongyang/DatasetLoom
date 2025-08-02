import { NextResponse } from 'next/server';
import { getDocumentByIds } from '@/server/db/documents';
import { chunker } from '@/lib/chunker';
import path from 'path';
import { type Chunks } from '@prisma/client';
import { nanoid } from 'nanoid';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from 'src/server/db/types';
import { AuditLog } from '@/lib/middleware/audit-log';
import type { ApiContext } from '@/types/api-context';
import cache, { generateChunkConfigHash } from '@/lib/utils/cache';
import { saveChunks } from '@/server/db/chunks';

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
                content: text.pageContent
                    .split('\n')
                    .filter(line => line.trim().length > 0)
                    .map(line => line.trim())
                    .join('\n'),
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
        const { chunkConfigHash } = body;

        // 参数验证
        if (!chunkConfigHash) {
            return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
        }

        // 获取缓存数据
        const cacheKey = `preview-chunks:${projectId}:${chunkConfigHash}`;
        const cachedChunks = cache.get(cacheKey);
        if (!cachedChunks || !Array.isArray(cachedChunks)) {
            return NextResponse.json({ error: '缓存数据无效或已过期，请重新上传操作' }, { status: 400 });
        }

        // 处理分块数据
        await saveChunks(cachedChunks);

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
