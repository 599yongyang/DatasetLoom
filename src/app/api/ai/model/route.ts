import { NextResponse } from 'next/server';
import { createLlmModels, getLlmModelsByProviderName } from '@/server/db/llm-models'; // 导入db实例

// 获取LLM模型
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = url.searchParams;
        let providerName = searchParams.get('providerName');
        if (!providerName) {
            return NextResponse.json({ error: '参数错误' }, { status: 400 });
        }
        const models = await getLlmModelsByProviderName(providerName);
        if (!models) {
            return NextResponse.json({ error: 'LLM provider not found' }, { status: 404 });
        }
        return NextResponse.json(models);
    } catch (error) {
        console.error('Database query error:', error);
        return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }
}

//同步最新模型列表
export async function POST(request: Request) {
    try {
        const { newModels, providerName } = await request.json();
        const models = await getLlmModelsByProviderName(providerName);
        const existingModelIds = models.map(model => model.modelId);
        const diffModels = newModels.filter((item: any) => !existingModelIds.includes(item.modelId));
        if (diffModels.length > 0) {
            return NextResponse.json(await createLlmModels(diffModels));
        } else {
            return NextResponse.json({ message: 'No new models to insert' }, { status: 200 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
    }
}
