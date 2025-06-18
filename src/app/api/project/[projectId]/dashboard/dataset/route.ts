import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import type { ApiContext } from '@/types/api-context';
import { ProjectRole } from '@/schema/types';
import { datasetKanbanData } from '@/lib/db/dataset';

/**
 * 获取数据集概览
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const data = await datasetKanbanData(projectId);
        return Response.json(data);
    } catch (error) {
        console.error('获取项目详情出错:', error);
        return Response.json({ error: error instanceof Error ? error.message : error }, { status: 500 });
    }
});
