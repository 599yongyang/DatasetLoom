import { NextResponse } from 'next/server';
import { mergeChunks } from '@/lib/db/chunks';

// 获取文本块内容
export async function POST(request: Request, props: { params: Promise<{ projectId: string }> }) {
    try {
        // 获取动态路由参数
        const params = await props.params;
        const { projectId } = params;
        const { sourceId, targetId } = await request.json();
        // 验证参数
        if (!projectId) {
            return NextResponse.json({ error: 'Project ID cannot be empty' }, { status: 400 });
        }
        if (!sourceId || !targetId) {
            return NextResponse.json({ error: 'Source ID and Target ID cannot be empty' }, { status: 400 });
        }

        const res = await mergeChunks(sourceId, targetId);
        return NextResponse.json(res);
    } catch (error) {
        console.error('Failed to get text block content:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get text block content' },
            { status: 500 }
        );
    }
}
