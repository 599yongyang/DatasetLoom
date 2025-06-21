import { NextResponse } from 'next/server';
import { getModelConfig, saveModelConfig } from '@/lib/db/model-config';
import { getLlmProviderIds, saveLlmProvider } from '@/lib/db/llm-providers';
import { nanoid } from 'nanoid';
import type { LlmProviders } from '@prisma/client';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import type { ApiContext } from '@/types/api-context';
import { AuditLog } from '@/lib/middleware/audit-log';
import { DEFAULT_PROVIDERS } from '@/constants/model';

/**
 * 获取模型配置
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const url = new URL(request.url);
        const searchParams = url.searchParams;
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
});

/**
 * 保存模型配置
 */
export const POST = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;

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
});
