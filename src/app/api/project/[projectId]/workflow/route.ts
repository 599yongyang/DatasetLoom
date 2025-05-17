import { NextResponse } from 'next/server';
import { getWorkflow, insertWorkflow } from '@/lib/db/workflow';
import { getAllQuestionsByProjectId, getQuestions, getQuestionsIds } from '@/lib/db/questions';

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
        return NextResponse.json({
            success: true,
            result
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

        // 获取问题列表
        const questions = await getWorkflow(
            projectId,
            parseInt(searchParams.get('page') ?? '1'),
            parseInt(searchParams.get('size') ?? '10')
        );
        return NextResponse.json(questions);
    } catch (error) {
        console.error('Failed to get workflow:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get workflow' },
            { status: 500 }
        );
    }
}
