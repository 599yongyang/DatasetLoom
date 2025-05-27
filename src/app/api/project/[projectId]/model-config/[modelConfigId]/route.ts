import { NextResponse } from 'next/server';
import { deleteModelConfigById, updateModelConfigDefault, updateModelConfigStatus } from '@/lib/db/model-config';

type Params = Promise<{ projectId: string; modelConfigId: string }>;

// 删除模型配置
export async function DELETE(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId, modelConfigId } = params;
        // 验证项目 ID
        if (!projectId) {
            return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
        }
        await deleteModelConfigById(modelConfigId);
        return NextResponse.json(true);
    } catch (error) {
        console.error('Error obtaining model configuration:', error);
        return NextResponse.json({ error: 'Failed to obtain model configuration' }, { status: 500 });
    }
}

export async function PUT(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId, modelConfigId } = params;
        const { status } = await request.json();
        // 验证项目 ID
        if (!projectId) {
            return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
        }
        await updateModelConfigStatus(modelConfigId, status);
        return NextResponse.json(true);
    } catch (error) {
        console.error('Error update model configuration:', error);
        return NextResponse.json({ error: 'Failed to update model configuration' }, { status: 500 });
    }
}

export async function PATCH(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId, modelConfigId } = params;
        // 验证项目 ID
        if (!projectId) {
            return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
        }
        await updateModelConfigDefault(modelConfigId);
        return NextResponse.json(true);
    } catch (error) {
        console.error('Error update model configuration:', error);
        return NextResponse.json({ error: 'Failed to update model configuration' }, { status: 500 });
    }
}
