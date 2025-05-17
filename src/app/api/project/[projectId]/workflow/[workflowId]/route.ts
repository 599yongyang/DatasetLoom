import { NextResponse } from 'next/server';
import { getWorkflow, getWorkflowById, insertWorkflow } from '@/lib/db/workflow';
import { getAllQuestionsByProjectId, getQuestions, getQuestionsIds } from '@/lib/db/questions';

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
