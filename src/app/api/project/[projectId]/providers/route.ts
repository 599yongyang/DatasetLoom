import { NextResponse } from 'next/server';
import { checkLlmProviders, getLlmProviders, saveLlmProvider } from '@/lib/db/llm-providers';

// 获取 LLM 提供商数据
type Params = Promise<{ projectId: string }>;

export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        const result = await getLlmProviders(projectId);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Database query error:', error);
        return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }
}

export async function POST(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;

        // 验证项目 ID
        if (!projectId) {
            return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
        }
        // 获取请求体
        const { provider, type } = await request.json();

        // 验证请求体
        if (!provider) {
            return NextResponse.json({ error: 'The providerInfo cannot be empty ' }, { status: 400 });
        }
        provider.projectId = projectId;
        if (type === 'add') {
            const check = await checkLlmProviders(projectId, provider.name);
            if (check) {
                return NextResponse.json({ error: 'The providerInfo already exists' }, { status: 400 });
            }
        }
        const res = await saveLlmProvider(provider);
        return NextResponse.json(res);
    } catch (error) {
        console.error('Error updating model configuration:', error);
        return NextResponse.json({ error: 'Failed to update model configuration' }, { status: 500 });
    }
}
