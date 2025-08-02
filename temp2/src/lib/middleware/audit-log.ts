import { NextRequest } from 'next/server';
import { auth } from '@/server/auth';
import type { ApiContext } from '@/types/api-context';

type ApiHandler = (req: NextRequest, context: ApiContext) => Promise<Response>;

export function AuditLog() {
    return function (handler: ApiHandler) {
        return async function (req: NextRequest, context: ApiContext) {
            const session = await auth();
            const user = session?.user;

            const start = Date.now();

            try {
                const response = await handler(req, context);

                const logEntry = {
                    timestamp: new Date().toISOString(),
                    userId: user?.id ?? 'anonymous',
                    userEmail: user?.email ?? 'anonymous',
                    method: req.method,
                    path: req.url,
                    status: response.status,
                    duration: Date.now() - start,
                    projectId: context.projectId || null
                };

                console.log('Audit Log:', logEntry);

                return response;
            } catch (error: any) {
                console.error('API Error:', {
                    error: error.message,
                    stack: error.stack,
                    method: req.method,
                    url: req.url,
                    userId: user?.id
                });

                throw error;
            }
        };
    };
}
