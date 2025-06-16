import { NextResponse } from 'next/server';
import { mergeChunks } from '@/lib/db/chunks';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import { AuditLog } from '@/lib/middleware/audit-log';

/**
 * 合并块
 */
export const POST = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request) => {
    try {
        // 获取动态路由参数
        const { sourceId, targetId } = await request.json();

        // 验证参数
        if (!sourceId || !targetId) {
            return NextResponse.json({ error: 'Source ID and Target ID cannot be empty' }, { status: 400 });
        }

        const res = await mergeChunks(sourceId, targetId);
        return NextResponse.json(res);
    } catch (error) {
        console.error('Failed to get text block content:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get text block content' },
            { status: 500 }
        );
    }
});
