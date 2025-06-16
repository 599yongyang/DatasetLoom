import { NextResponse } from 'next/server';
import {
    deleteQuestion,
    getNavigationItems,
    getQuestionById,
    getQuestionsCount,
    getQuestionWithDatasetById,
    updateQuestion
} from '@/lib/db/questions';
import { type Questions } from '@prisma/client';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import { AuditLog } from '@/lib/middleware/audit-log';
import type { ApiContext } from '@/types/api-context';

/**
 * 删除单个问题
 */
export const DELETE = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { questionId } = context;
        // 验证参数
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
});

type OperateType = 'prev' | 'next';

function isOperateType(value: string | null): value is OperateType {
    return value === 'prev' || value === 'next';
}

/**
 * 获取单个问题
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId, questionId } = context;
        // 验证参数
        if (!questionId) {
            return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
        }
        const { total, confirmedCount } = await getQuestionsCount(projectId);

        const { searchParams } = new URL(request.url);
        const operateType = searchParams.get('operateType');
        if (operateType !== null && isOperateType(operateType)) {
            const data = await getNavigationItems(projectId, questionId, operateType);
            return NextResponse.json({ data, total, confirmedCount });
        }
        // 获取问题以及数据集
        const data = await getQuestionWithDatasetById(questionId);
        return NextResponse.json({ data, total, confirmedCount });
    } catch (error) {
        console.error('Delete failed:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Delete failed' }, { status: 500 });
    }
});

/**
 * 更新单个问题
 */
export const PATCH = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { questionId } = context;
        const { confirmed } = await request.json();
        if (!questionId) {
            return NextResponse.json({ error: 'questionId ID cannot be empty' }, { status: 400 });
        }
        let question = await getQuestionById(questionId);
        if (!question) {
            return NextResponse.json({ error: 'question does not exist' }, { status: 404 });
        }

        const data = await updateQuestion({ id: questionId, confirmed: Boolean(confirmed) } as Questions);

        return NextResponse.json({
            success: true,
            message: 'question updated successfully',
            data
        });
    } catch (error) {
        console.error('Failed to update question:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update question' },
            { status: 500 }
        );
    }
});
