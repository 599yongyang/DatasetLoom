import { NextResponse } from 'next/server';
import { deleteWorkflow, getWorkflow, insertWorkflow } from '@/lib/db/workflow';
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
        const qService = await queueService;
        if (!qService.isAvailable()) {
            throw new Error('队列服务不可用，请检查Redis连接');
        }
        if (!qService.isWorkerRunning()) {
            await qService.initializeWorker();
        }
        const result = await insertWorkflow(data);
        // 将工作流加入队列
        const scheduled = await qService.scheduleWorkflow(result.id, projectId);
        if (!scheduled) {
            // 如果调度失败，回滚数据库记录
            await deleteWorkflow(result.id);
            throw new Error('工作流调度失败');
        }
        return NextResponse.json({ success: true, data: { workflowId: result.id, scheduled: true } });
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
