import { NextResponse } from 'next/server';
import { getChunkGraph } from '@/lib/db/chunk-graph';

type Params = Promise<{ projectId: string }>;

export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
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
}
