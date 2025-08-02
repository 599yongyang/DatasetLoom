import { NextResponse } from 'next/server';
import { getChunkGraph } from '@/server/db/chunk-graph';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from 'src/server/db/types';
import type { ApiContext } from '@/types/api-context';

/**
 * 获取图谱
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const { searchParams } = new URL(request.url);
        // 验证参数
        if (!projectId) {
            return NextResponse.json({ error: 'Project ID cannot be empty' }, { status: 400 });
        }
        let fileIds: string[] = [];
        if (searchParams.get('kid')) {
            fileIds.push(searchParams.get('kid') as string);
        }
        const graph = await getChunkGraph(projectId, fileIds);
        return NextResponse.json(graph);
    } catch (error) {
        console.error('Failed to get text block content:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get text block content' },
            { status: 500 }
        );
    }
});
