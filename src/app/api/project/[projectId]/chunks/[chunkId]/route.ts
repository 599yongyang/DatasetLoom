import { NextResponse } from 'next/server';
import { deleteChunkByIds, getChunkById, updateChunkById } from '@/server/db/chunks';
import type { Chunks } from '@prisma/client';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from 'src/server/db/types';
import type { ApiContext } from '@/types/api-context';
import { AuditLog } from '@/lib/middleware/audit-log';

/**
 * 获取文本块内容
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { chunkId } = context;
        // 验证参数
        if (!chunkId) {
            return NextResponse.json({ error: 'text block ID cannot be empty' }, { status: 400 });
        }
        // 获取文本块内容
        const chunk = await getChunkById(chunkId);

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
 * 删除文本块
 */
export const DELETE = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { chunkId } = context;
        // 验证参数
        if (!chunkId) {
            return NextResponse.json({ error: 'text block ID cannot be empty' }, { status: 400 });
        }
        await deleteChunkByIds([chunkId]);

        return NextResponse.json({ message: 'Text block deleted successfully' });
    } catch (error) {
        console.error('Failed to delete text block:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete text block' },
            { status: 500 }
        );
    }
});

/**
 * 编辑文本块
 */
export const PUT = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { chunkId } = context;
        // 验证参数
        if (!chunkId) {
            return NextResponse.json({ error: 'text block ID cannot be empty' }, { status: 400 });
        }

        const requestData = await request.json();
        const { name, content, tags } = requestData;

        let res = await updateChunkById(chunkId, { name, content, tags, size: content.length } as Chunks);
        return NextResponse.json(res);
    } catch (error) {
        console.error('编辑文本块失败:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : '编辑文本块失败' }, { status: 500 });
    }
});
