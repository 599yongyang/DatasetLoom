import { NextResponse } from 'next/server';
import { getWorkflowById } from '@/lib/db/workflow';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import type { ApiContext } from '@/types/api-context';

/**
 * 获取工作流
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { searchParams } = new URL(request.url);

        const workflowId = searchParams.get('workflowId');
        if (!workflowId) {
            return NextResponse.json({ error: 'Missing workflow ID' }, { status: 400 });
        }
        const workflow = await getWorkflowById(workflowId);
        if (!workflow) {
            return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
        }

        return NextResponse.json(workflow);
    } catch (error) {
        console.error('Failed to get workflow:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get workflow' },
            { status: 500 }
        );
    }
});
