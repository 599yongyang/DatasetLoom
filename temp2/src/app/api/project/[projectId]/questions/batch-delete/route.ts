import { NextResponse } from 'next/server';
import { batchDeleteQuestions } from '@/server/db/questions';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from 'src/server/db/types';
import { AuditLog } from '@/lib/middleware/audit-log';

/**
 * 批量删除问题
 */
export const DELETE = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request) => {
    try {
        const body = await request.json();
        const { questionIds } = body;

        // 验证参数
        if (questionIds.length === 0) {
            return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
        }

        // 删除问题
        await batchDeleteQuestions(questionIds);

        return NextResponse.json({ success: true, message: 'Delete successful' });
    } catch (error) {
        console.error('Delete failed:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Delete failed' }, { status: 500 });
    }
});
