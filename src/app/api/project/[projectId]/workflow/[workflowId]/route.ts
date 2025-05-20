import { NextResponse } from 'next/server';
import { deleteWorkflow, getWorkflowById } from '@/lib/db/workflow';

type Params = Promise<{ projectId: string; workflowId: string }>;

export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId, workflowId } = params;
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
}

export async function DELETE(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId, workflowId } = params;
        // 验证参数
        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }
        if (!workflowId) {
            return NextResponse.json({ error: 'WorkflowId ID is required' }, { status: 400 });
        }
        // 删除工作流
        await deleteWorkflow(workflowId);

        return NextResponse.json({ success: true, message: 'Delete successful' });
    } catch (error) {
        console.error('Delete failed:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Delete failed' }, { status: 500 });
    }
}
