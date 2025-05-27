import { createProject, getProjects, isExistByName } from '@/lib/db/projects';
import { copyModelConfig } from '@/lib/db/model-config';

export async function POST(request: Request) {
    try {
        const projectData = await request.json();
        // 验证必要的字段
        if (!projectData.name) {
            return Response.json({ error: '项目名称不能为空' }, { status: 400 });
        }

        // 验证项目名称是否已存在
        if (await isExistByName(projectData.name)) {
            return Response.json({ error: '项目名称已存在' }, { status: 400 });
        }
        // 创建项目
        const newProject = await createProject({ name: projectData.name, description: projectData.description });
        // 如果指定了要复用的项目配置
        if (projectData.copyId) {
            await copyModelConfig(newProject.id, projectData.copyId);
        }
        const data = await getProjects('');
        return Response.json({ data, id: newProject.id }, { status: 200 });
    } catch (error: unknown) {
        console.error('创建项目出错:', error);
        if (error instanceof Error) {
            return Response.json({ error: error.message }, { status: 500 });
        } else {
            return Response.json({ error: '未知错误' }, { status: 500 });
        }
    }
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = url.searchParams;
        // // 获取所有项目
        const projects = await getProjects(searchParams.get('name') ?? '');
        return Response.json(projects);
    } catch (error: unknown) {
        console.error('获取项目列表出错:', error);
        if (error instanceof Error) {
            return Response.json({ error: error.message }, { status: 500 });
        } else {
            return Response.json({ error: '未知错误' }, { status: 500 });
        }
    }
}
