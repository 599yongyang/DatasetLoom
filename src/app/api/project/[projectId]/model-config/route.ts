import { NextResponse } from 'next/server';
import { createInitModelConfig, getModelConfigByProjectId, saveModelConfig } from '@/lib/db/model-config';
import { getProject } from '@/lib/db/projects';
import { DEFAULT_MODEL_SETTINGS, MODEL_PROVIDERS } from '@/constants/model';
import type { ModelConfig } from '@prisma/client';

type Params = Promise<{ projectId: string }>;

// 获取模型配置列表
export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        // 验证项目 ID
        if (!projectId) {
            return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
        }
        let project = await getProject(projectId);
        let modelConfigList = await getModelConfigByProjectId(projectId);
        if (!modelConfigList || modelConfigList.length === 0) {
            let insertModelConfigList: ModelConfig[] = [];
            MODEL_PROVIDERS.forEach(item => {
                let data = {
                    projectId: projectId,
                    providerId: item.id,
                    providerName: item.name,
                    endpoint: item.defaultEndpoint,
                    apiKey: '',
                    modelId: item.defaultModels.length > 0 ? item.defaultModels[0] : '',
                    modelName: item.defaultModels.length > 0 ? item.defaultModels[0] : '',
                    type: 'text',
                    temperature: DEFAULT_MODEL_SETTINGS.temperature,
                    maxTokens: DEFAULT_MODEL_SETTINGS.maxTokens,
                    topK: 0,
                    topP: 0,
                    status: 1
                };
                insertModelConfigList.push(data as ModelConfig);
            });
            modelConfigList = (await createInitModelConfig(insertModelConfigList)) as ModelConfig[];
        }

        return NextResponse.json({ data: modelConfigList, defaultModelConfigId: project?.defaultModelConfigId });
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
        modelConfig.projectId = projectId;
        const res = await saveModelConfig(modelConfig);

        return NextResponse.json(res);
    } catch (error) {
        console.error('Error updating model configuration:', error);
        return NextResponse.json({ error: 'Failed to update model configuration' }, { status: 500 });
    }
}
