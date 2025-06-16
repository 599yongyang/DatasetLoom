import { NextResponse } from 'next/server';
import {
    checkPreferencePair,
    getPreferencePair,
    insertPreferencePair,
    updatePreferencePair
} from '@/lib/db/preference-pair';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import type { ApiContext } from '@/types/api-context';
import { AuditLog } from '@/lib/middleware/audit-log';

/**
 * 获取用户偏好数据集样本
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const url = new URL(request.url);
        const searchParams = url.searchParams;
        const questionId = searchParams.get('questionId');
        if (!questionId) {
            return NextResponse.json({ error: 'The question ID cannot be empty' }, { status: 400 });
        }
        const data = await getPreferencePair(projectId, questionId);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error get PreferencePair:', error);
        return NextResponse.json({ error: 'Failed to get PreferencePair' }, { status: 500 });
    }
});

/**
 * 保存用户偏好数据集样本
 */
export const POST = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const pp = await request.json();
        const check = await checkPreferencePair(projectId, pp.questionId);
        if (check) {
            await updatePreferencePair(pp);
        } else {
            await insertPreferencePair(pp);
        }
        return NextResponse.json({ message: 'success' });
    } catch (error) {
        console.error('Error save PreferencePair:', error);
        return NextResponse.json({ error: 'Failed to save PreferencePair' }, { status: 500 });
    }
});
