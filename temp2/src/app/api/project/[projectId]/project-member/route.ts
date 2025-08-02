import { NextResponse } from 'next/server';
import {
    addProjectMember,
    getProjectMember,
    removeProjectMember,
    updateProjectMemberRole
} from '@/server/db/project-member';
import { getUserByEmails } from '@/server/db/users';
import { ProjectRole } from 'src/server/db/types';
import { compose } from '@/lib/middleware/compose';
import { AuditLog } from '@/lib/middleware/audit-log';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import type { ApiContext } from '@/types/api-context';

/**
 * 获取项目成员列表
 */
export const GET = compose(AuthGuard(ProjectRole.ADMIN))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const { searchParams } = new URL(request.url);
        const input = searchParams.get('input');
        let memberList = await getProjectMember(projectId, input || '');
        return NextResponse.json(memberList);
    } catch (error) {
        console.error('Error get parserConfig List:', error);
        return NextResponse.json({ error: 'Failed to get parserConfig List' }, { status: 500 });
    }
});

/**
 * 添加项目成员
 */
export const POST = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId, user } = context;
        // 获取请求体
        const { emails, role } = await request.json();
        // 验证请求体
        if (!Array.isArray(emails) || emails.length === 0 || !role) {
            return NextResponse.json({ error: 'The request body cannot be empty' }, { status: 400 });
        }

        const res = await getUserByEmails(emails.filter(email => email !== user.email));
        if (!res || res.length === 0) {
            return NextResponse.json({ error: 'No valid users found' }, { status: 400 });
        }

        res.map(async item => {
            await addProjectMember(projectId, item.id, role);
        });

        return NextResponse.json({ message: 'Success' }, { status: 200 });
    } catch (error) {
        console.error('Error updating model configuration:', error);
        return NextResponse.json({ error: 'Failed to update model configuration' }, { status: 500 });
    }
});

/**
 * 删除项目成员
 */
export const DELETE = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return new Response('Not Found', { status: 404 });
        }

        await removeProjectMember(id);

        return new Response('Chat deleted', { status: 200 });
    } catch (error) {
        return new Response('An error occurred while processing your request!', {
            status: 500
        });
    }
});

/**
 * 修改项目成员权限
 */
export const PUT = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request) => {
    try {
        // 获取请求体
        const { id, role } = await request.json();

        if (!id || !role) {
            return NextResponse.json({ error: 'The request body cannot be empty' }, { status: 400 });
        }

        await updateProjectMemberRole(id, role);

        return NextResponse.json({ message: 'Success' }, { status: 200 });
    } catch (error) {
        console.error('Error updating model configuration:', error);
        return NextResponse.json({ error: 'Failed to update model configuration' }, { status: 500 });
    }
});
