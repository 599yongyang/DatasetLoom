import { NextResponse } from 'next/server';
import { getChunkByProjectId } from '@/lib/db/chunks';

// 获取文本块内容
export async function POST(request: Request, props: { params: Promise<{ projectId: string }> }) {
    try {
        // 获取动态路由参数
        const params = await props.params;
        const { projectId } = params;
        // 验证参数
        if (!projectId) {
            return NextResponse.json({ error: 'Project ID cannot be empty' }, { status: 400 });
        }
        const { array, filter }: { array: string[]; filter: string } = await request.json();
        if (array && !Array.isArray(array)) {
            return NextResponse.json({ error: 'Invalid array parameter' }, { status: 400 });
        }
        // 获取文本块内容
        const chunk = await getChunkByProjectId(projectId, filter, array);

        return NextResponse.json({ data: chunk });
    } catch (error) {
        console.error('Failed to get text block content:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get text block content' },
            { status: 500 }
        );
    }
}
