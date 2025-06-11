// 获取项目详情
import { deleteProject, getProject, updateProject } from '@/lib/db/projects';
import { auth } from '@/server/auth';
import { hasProjectPermission } from '@/lib/db/users';

type Params = Promise<{ projectId: string }>;

export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        const project = await getProject(projectId);
        if (!project) {
            return Response.json({ error: '项目不存在' }, { status: 404 });
        }
        return Response.json(project);
    } catch (error) {
        console.error('获取项目详情出错:', error);
        return Response.json({ error: error instanceof Error ? error.message : error }, { status: 500 });
    }
}

// 更新项目
export async function PUT(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        const projectData = await request.json();
        const session = await auth();

        if (!session || !session.user || !session.user.id) {
            return new Response('Unauthorized', { status: 401 });
        }
        const allowed = await hasProjectPermission(session.user.id, projectId, ['OWNER', 'ADMIN']);
        if (!allowed) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
}

// 删除项目
export async function DELETE(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return new Response('Unauthorized', { status: 401 });
        }
        const allowed = await hasProjectPermission(session.user.id, projectId, ['OWNER', 'ADMIN']);
        if (!allowed) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const success = await deleteProject(projectId);

        if (!success) {
            return Response.json({ error: '项目不存在' }, { status: 404 });
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('删除项目出错:', error);
        return Response.json({ error: error instanceof Error ? error.message : error }, { status: 500 });
    }
}
