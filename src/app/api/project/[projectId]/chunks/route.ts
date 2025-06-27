import { NextResponse } from 'next/server';
import { deleteChunkByIds, getChunkById, getChunkByIds, getChunksPagination } from '@/lib/db/chunks';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import type { ApiContext } from '@/types/api-context';
import { AuditLog } from '@/lib/middleware/audit-log';
import { getProject } from '@/lib/db/projects';
import { getModelConfigById } from '@/lib/db/model-config';
import { processChunks } from '@/app/api/project/[projectId]/documents/chunker/actions';

/**
 * 获取分块列表
 */
export const POST = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const { searchParams } = new URL(request.url);
        // 验证参数
        const { array, status }: { array: string[]; status: string } = await request.json();
        if (array && !Array.isArray(array)) {
            return NextResponse.json({ error: 'Invalid array parameter' }, { status: 400 });
        }
        // 获取文本块内容
        const chunk = await getChunksPagination(
            projectId,
            parseInt(searchParams.get('page') ?? '1'),
            parseInt(searchParams.get('size') ?? '10'),
            status,
            array
        );

        return NextResponse.json(chunk);
    } catch (error) {
        console.error('Failed to get text block content:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get text block content' },
            { status: 500 }
        );
    }
});

/**
 * 删除分块
 */
export const DELETE = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request) => {
    try {
        const body = await request.json();
        const { chunkIds } = body;

        // 验证参数
        if (chunkIds.length === 0) {
            return NextResponse.json({ error: 'Chunk ID is required' }, { status: 400 });
        }
        // 删除问题
        await deleteChunkByIds(chunkIds);

        return NextResponse.json({ success: true, message: 'Delete successful' });
    } catch (error) {
        console.error('Delete failed:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Delete failed' }, { status: 500 });
    }
});

/**
 * 分析分块内容生成标签与关系等
 */
export const PUT = compose(AuthGuard(ProjectRole.EDITOR))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const { chunkId, modelConfigId, language } = await request.json();

        // 参数验证
        if (!chunkId || !modelConfigId || !language) {
            return NextResponse.json(
                { error: '缺少必要参数: chunkConfigHash, modelConfigId 或 language' },
                { status: 400 }
            );
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

        // 获取文本块内容
        const chunk = await getChunkById(chunkId);
        if (!chunk) {
            return NextResponse.json({ error: '指定的文本块不存在' }, { status: 404 });
        }
        // 处理分块数据
        await processChunks({
            chunkId: chunk.id,
            context: chunk.content,
            model,
            language,
            globalPrompt: projectData.globalPrompt,
            domainTreePrompt: projectData.domainTreePrompt,
            projectId
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to get text block content:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get text block content' },
            { status: 500 }
        );
    }
});
