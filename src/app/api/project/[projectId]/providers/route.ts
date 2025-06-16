import { NextResponse } from 'next/server';
import { checkLlmProviders, getLlmProviders, saveLlmProvider } from '@/lib/db/llm-providers';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import type { ApiContext } from '@/types/api-context';
import { AuditLog } from '@/lib/middleware/audit-log';

/**
 * 获取模型服务商列表
 */
export const GET = compose(AuthGuard(ProjectRole.ADMIN))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const result = await getLlmProviders(projectId);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Database query error:', error);
        return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }
});

/**
 * 添加模型服务商
 */
export const POST = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;

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
});
