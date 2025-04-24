// 获取项目详情
import { deleteProject, getProject, updateProject } from '@/lib/db/projects';

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

        const updatedProject = await updateProject(projectId, projectData);

        if (!updatedProject) {
            return Response.json({ error: '项目不存在' }, { status: 404 });
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
