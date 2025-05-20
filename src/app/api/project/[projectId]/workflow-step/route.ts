import { NextResponse } from 'next/server';
import { getWorkflowById } from '@/lib/db/workflow';

type Params = Promise<{ projectId: string }>;

export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        // 验证项目ID
        if (!projectId) {
            return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
        }
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
}
