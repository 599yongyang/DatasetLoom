import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from 'src/server/db/types';
import type { ApiContext } from '@/types/api-context';
import { getModelUsageList } from '@/server/db/model-usage';

/**
 * 获取模型使用情况
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;

        const { searchParams } = new URL(request.url);
        const modelConfigId = searchParams.get('modelConfigId');
        const day = searchParams.get('day');

        if (!modelConfigId || !day) {
            return Response.json([]);
        }

        const data = await getModelUsageList(projectId, modelConfigId, Number(day));

        return Response.json(data.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()));
    } catch (error) {
        console.error('获取项目详情出错:', error);
        return Response.json({ error: error instanceof Error ? error.message : error }, { status: 500 });
    }
});
