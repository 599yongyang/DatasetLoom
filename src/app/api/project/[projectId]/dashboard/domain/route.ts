import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import type { ApiContext } from '@/types/api-context';
import { ProjectRole } from '@/schema/types';
import { datasetKanbanData } from '@/lib/db/dataset';
import { getChunkDomain } from '@/lib/db/chunk-metadata';

/**
 * 获取知识库领域分析
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const { searchParams } = new URL(request.url);
        const level = searchParams.get('level');
        const data = await getChunkDomain(projectId, level === '1' ? 'domain' : 'subDomain');
        return Response.json(data);
    } catch (error) {
        console.error('获取项目详情出错:', error);
        return Response.json({ error: error instanceof Error ? error.message : error }, { status: 500 });
    }
});
