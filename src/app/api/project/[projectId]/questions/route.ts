import { NextResponse } from 'next/server';
import { getQuestions, saveQuestions, updateQuestion } from '@/server/db/questions';
import type { Questions } from '@prisma/client';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole, QuestionContextType } from 'src/server/db/types';
import type { ApiContext } from '@/types/api-context';
import { AuditLog } from '@/lib/middleware/audit-log';
import { getBlockCoordinates } from '@/server/db/image-block';
import { replaceMentionsWithCoordinates } from '@/lib/utils/mentions';

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
        const {
            questions,
            contextType,
            contextId,
            contextName
        }: {
            questions: string[];
            contextType: QuestionContextType;
            contextId: string;
            contextName: string;
        } = body;

        // 验证必要参数
        if (!contextType || questions.length === 0 || !contextId || !contextName) {
            return NextResponse.json({ error: 'Missing necessary parameters' }, { status: 400 });
        }
        const questionList: Questions[] = await Promise.all(
            questions.map(async item => {
                const question: Partial<Questions> = {
                    projectId,
                    question: item,
                    contextType,
                    contextId,
                    contextName
                };

                if (contextType === QuestionContextType.IMAGE) {
                    const { realQuestion, regions } = await replaceMentionsWithCoordinates(item);
                    question.realQuestion = realQuestion;
                    question.contextData = JSON.stringify(regions);
                }

                return question as Questions;
            })
        );

        // 保存
        let data = await saveQuestions(questionList);

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
