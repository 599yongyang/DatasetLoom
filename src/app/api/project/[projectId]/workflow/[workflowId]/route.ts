import { NextResponse } from 'next/server';
import { deleteWorkflow, getWorkflowById } from '@/lib/db/workflow';
import queueService from '@/lib/queue';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import type { ApiContext } from '@/types/api-context';
import { AuditLog } from '@/lib/middleware/audit-log';

/**
 * 获取工作流
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId, workflowId } = context;
        // 验证项目ID
        if (!projectId || !workflowId) {
            return NextResponse.json({ error: 'Missing project ID or workflow ID' }, { status: 400 });
        }
        const workflow = await getWorkflowById(workflowId);
        return NextResponse.json(workflow);
    } catch (error) {
        console.error('Failed to get workflow:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get workflow' },
            { status: 500 }
        );
    }
});

/**
 * 删除工作流
 */
export const DELETE = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId, workflowId } = context;
        // 验证参数
        if (!workflowId) {
            return NextResponse.json({ error: 'WorkflowId ID is required' }, { status: 400 });
        }
        // 删除工作流
        await deleteWorkflow(workflowId);
        const qService = await queueService;
        if (qService.isAvailable()) {
            await qService.deleteWorkflow(workflowId, projectId);
        }
        return NextResponse.json({ success: true, message: 'Delete successful' });
    } catch (error) {
        console.error('Delete failed:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Delete failed' }, { status: 500 });
    }
});
