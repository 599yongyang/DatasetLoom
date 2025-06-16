import { deleteProject, getProject, updateProject } from '@/lib/db/projects';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import { AuditLog } from '@/lib/middleware/audit-log';
import type { ApiContext } from '@/types/api-context';

/**
 * 获取项目详情
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const project = await getProject(projectId);
        if (!project) {
            return Response.json({ error: '项目不存在' }, { status: 404 });
        }
        return Response.json(project);
    } catch (error) {
        console.error('获取项目详情出错:', error);
        return Response.json({ error: error instanceof Error ? error.message : error }, { status: 500 });
    }
});

/**
 * 更新项目
 */
export const PUT = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const projectData = await request.json();

        const project = await getProject(projectId);
        if (!project) {
            return Response.json({ error: '项目不存在' }, { status: 404 });
        }

        const updatedProject = await updateProject(projectId, projectData);

        if (!updatedProject) {
            return Response.json({ error: '项目更新失败' }, { status: 500 });
        }

        return Response.json(updatedProject);
    } catch (error) {
        console.error('更新项目出错:', error);
        return Response.json({ error: error instanceof Error ? error.message : error }, { status: 500 });
    }
});

/**
 * 删除项目
 */
export const DELETE = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const success = await deleteProject(projectId);
        if (!success) {
            return Response.json({ error: '项目不存在' }, { status: 404 });
        }
        return Response.json({ success: true });
    } catch (error) {
        console.error('删除项目出错:', error);
        return Response.json({ error: error instanceof Error ? error.message : error }, { status: 500 });
    }
});
