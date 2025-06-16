import { NextResponse } from 'next/server';
import { getQuestions, isExistByQuestion, saveQuestions, updateQuestion } from '@/lib/db/questions';
import type { Questions } from '@prisma/client';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import type { ApiContext } from '@/types/api-context';
import { AuditLog } from '@/lib/middleware/audit-log';

/**
 * 获取项目的所有问题
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const { searchParams } = new URL(request.url);
        let status = searchParams.get('status');
        let answered = undefined;
        if (status === 'answered') answered = true;
        if (status === 'unanswered') answered = false;
        // 获取问题列表
        const questions = await getQuestions(
            projectId,
            parseInt(searchParams.get('page') ?? '1'),
            parseInt(searchParams.get('size') ?? '10'),
            answered,
            searchParams.get('input') ?? ''
        );

        return NextResponse.json(questions);
    } catch (error) {
        console.error('Failed to get questions:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get questions' },
            { status: 500 }
        );
    }
});

/**
 * 新增问题
 */
export const POST = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const body = await request.json();
        const { question, chunkId, label } = body;

        // 验证必要参数
        if (!projectId || !question || !chunkId) {
            return NextResponse.json({ error: 'Missing necessary parameters' }, { status: 400 });
        }

        // 检查问题是否已存在
        const existingQuestion = await isExistByQuestion(question);
        if (existingQuestion) {
            return NextResponse.json({ error: 'Question already exists' }, { status: 400 });
        }

        // 添加新问题
        let questions = [
            {
                chunkId: chunkId,
                question: question,
                label: label || 'other'
            }
        ] as Questions[];
        // 保存更新后的数据
        let data = await saveQuestions(questions);

        // 返回成功响应
        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to create question:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create question' },
            { status: 500 }
        );
    }
});

/**
 * 更新问题
 */
export const PUT = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request) => {
    try {
        const body = await request.json();
        // 保存更新后的数据
        let data = await updateQuestion(body);
        // 返回更新后的问题数据
        return NextResponse.json(data);
    } catch (error) {
        console.error('更新问题失败:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : '更新问题失败' }, { status: 500 });
    }
});
