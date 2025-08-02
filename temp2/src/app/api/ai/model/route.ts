import { NextResponse } from 'next/server';
import { createModelRegistry, getModelRegistryByProviderName } from '@/server/db/model-registry';

// 获取AI模型
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = url.searchParams;
        let providerName = searchParams.get('providerName');
        if (!providerName) {
            return NextResponse.json({ error: '参数错误' }, { status: 400 });
        }
        const models = await getModelRegistryByProviderName(providerName);
        if (!models) {
            return NextResponse.json({ error: 'Model provider not found' }, { status: 404 });
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
        const models = await getModelRegistryByProviderName(providerName);
        const existingModelIds = models.map(model => model.modelId);
        const diffModels = newModels.filter((item: any) => !existingModelIds.includes(item.modelId));
        if (diffModels.length > 0) {
            return NextResponse.json(await createModelRegistry(diffModels));
        } else {
            return NextResponse.json({ message: 'No new models to insert' }, { status: 200 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
    }
}
