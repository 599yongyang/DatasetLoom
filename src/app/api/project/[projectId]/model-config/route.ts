import { NextResponse } from 'next/server';
import { getModelConfig, saveModelConfig } from '@/lib/db/model-config';
import { getProject } from '@/lib/db/projects';
import { getLlmProviderIds, saveLlmProvider } from '@/lib/db/llm-providers';
import { DEFAULT_PROVIDERS } from '@/constants/provides';
import { nanoid } from 'nanoid';
import type { LlmProviders } from '@prisma/client';

type Params = Promise<{ projectId: string }>;

// 获取模型配置列表
export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        const url = new URL(request.url);
        const searchParams = url.searchParams;
        // 验证项目 ID
        if (!projectId) {
            return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
        }
        let project = await getProject(projectId);
        if (!project) {
            return NextResponse.json({ error: 'The project does not exist' }, { status: 404 });
        }
        let providerIds: string[] = [];
        const providerId = searchParams.get('providerId');
        if (providerId) {
            providerIds.push(providerId);
        } else {
            providerIds = await getLlmProviderIds(projectId);
        }
        const status = searchParams.get('status');
        let whereStatus = undefined;
        if (status) {
            whereStatus = Boolean(status);
        }

        let modelConfigList = await getModelConfig(providerIds, whereStatus);
        return NextResponse.json(modelConfigList);
    } catch (error) {
        console.error('Error obtaining model configuration:', error);
        return NextResponse.json({ error: 'Failed to obtain model configuration' }, { status: 500 });
    }
}

// 保存模型配置
export async function POST(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;

        // 验证项目 ID
        if (!projectId) {
            return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
        }
        // 获取请求体
        const modelConfig = await request.json();

        // 验证请求体
        if (!modelConfig) {
            return NextResponse.json({ error: 'The model configuration cannot be empty ' }, { status: 400 });
        }
        const isDefaultProvider = DEFAULT_PROVIDERS.find(provider => provider.id === modelConfig.providerId);

        if (isDefaultProvider) {
            const providerId = nanoid();
            await saveLlmProvider({
                id: providerId,
                name: isDefaultProvider.name,
                projectId,
                apiUrl: isDefaultProvider.apiUrl,
                apiKey: '',
                interfaceType: isDefaultProvider.interfaceType,
                icon: isDefaultProvider.icon
            } as LlmProviders);
            modelConfig.providerId = providerId;
        }

        modelConfig.projectId = projectId;
        const { provider, ...rest } = modelConfig;
        const res = await saveModelConfig(rest);

        return NextResponse.json(res);
    } catch (error) {
        console.error('Error updating model configuration:', error);
        return NextResponse.json({ error: 'Failed to update model configuration' }, { status: 500 });
    }
}
