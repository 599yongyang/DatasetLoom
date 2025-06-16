import { NextResponse } from 'next/server';
import { getWorkflow, insertWorkflow } from '@/lib/db/workflow';
import queueService from '@/lib/queue';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import { AuditLog } from '@/lib/middleware/audit-log';
import type { ApiContext } from '@/types/api-context';

/**
 * 创建工作流
 */
export const POST = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    const { projectId } = context;
    const data = await request.json();
    // 验证参数
    if (!projectId) {
        return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }
    try {
        const result = await insertWorkflow(data);
        // 将工作流加入队列
        await queueService.scheduleWorkflow(result.id, projectId);
        return NextResponse.json({
            success: true
        });
    } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : error }, { status: 500 });
    }
});
/**
 * 获取工作流列表
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;

        const { searchParams } = new URL(request.url);

        // 获取工作流列表
        const workflowList = await getWorkflow(
            projectId,
            parseInt(searchParams.get('page') ?? '1'),
            parseInt(searchParams.get('size') ?? '10')
        );
        return NextResponse.json(workflowList);
    } catch (error) {
        console.error('Failed to get workflow:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get workflow' },
            { status: 500 }
        );
    }
});
