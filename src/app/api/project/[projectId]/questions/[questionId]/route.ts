import { NextResponse } from 'next/server';
import { deleteQuestion } from '@/lib/db/questions';
type Params = Promise<{ projectId: string; questionId: string }>;
// 删除单个问题
export async function DELETE(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId, questionId } = params;
        // 验证参数
        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }
        if (!questionId) {
            return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
        }

        // 删除问题
        await deleteQuestion(questionId);

        return NextResponse.json({ success: true, message: 'Delete successful' });
    } catch (error) {
        console.error('Delete failed:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Delete failed' }, { status: 500 });
    }
}
