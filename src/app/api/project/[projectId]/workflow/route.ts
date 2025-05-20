import { NextResponse } from 'next/server';
import { getWorkflow, getWorkflowById, insertWorkflow } from '@/lib/db/workflow';
import queueService from '@/lib/queue';

type Params = Promise<{ projectId: string }>;

export async function POST(request: Request, props: { params: Params }) {
    const params = await props.params;
    const { projectId } = params;
    const data = await request.json();
    console.log(data);
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
}

export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        // 验证项目ID
        if (!projectId) {
            return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
        }
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
}
