import { NextRequest } from 'next/server';
import { checkProjectAccess } from '@/lib/utils/auth-helper';
import type { ProjectRole } from '@/lib/data-dictionary';
import type { ApiContext } from '@/types/api-context';

type ApiHandler = (req: NextRequest, context: ApiContext) => Promise<Response>;

export function AuthGuard(requiredRole: ProjectRole) {
    return function (handler: ApiHandler) {
        return async function (req: NextRequest, props: { params: Promise<{ projectId: string }> }) {
            const params = await props.params;
            const { projectId } = params;

            if (!projectId) {
                return new Response('Project ID is required', { status: 400 });
            }

            // 权限校验并获取 user
            const accessCheck = await checkProjectAccess(projectId, requiredRole);

            if (!accessCheck.success) {
                return new Response(accessCheck.message, { status: accessCheck.status });
            }

            const { user } = accessCheck;

            // 构造统一 context 对象
            const context: ApiContext = {
                req,
                user,
                ...params
            };

            return handler(req, context);
        };
    };
}
