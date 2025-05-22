import { NextResponse } from 'next/server';
import { deleteChunkByIds, getChunksPagination } from '@/lib/db/chunks';

// 获取文本块内容
export async function POST(request: Request, props: { params: Promise<{ projectId: string }> }) {
    try {
        // 获取动态路由参数
        const params = await props.params;
        const { projectId } = params;
        const { searchParams } = new URL(request.url);
        // 验证参数
        if (!projectId) {
            return NextResponse.json({ error: 'Project ID cannot be empty' }, { status: 400 });
        }
        const { array, status }: { array: string[]; status: string } = await request.json();
        if (array && !Array.isArray(array)) {
            return NextResponse.json({ error: 'Invalid array parameter' }, { status: 400 });
        }
        // 获取文本块内容
        const chunk = await getChunksPagination(
            projectId,
            parseInt(searchParams.get('page') ?? '1'),
            parseInt(searchParams.get('size') ?? '10'),
            status,
            array
        );

        return NextResponse.json(chunk);
    } catch (error) {
        console.error('Failed to get text block content:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get text block content' },
            { status: 500 }
        );
    }
}

// 批量删除问题
export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { chunkIds } = body;

        // 验证参数
        if (chunkIds.length === 0) {
            return NextResponse.json({ error: 'Chunk ID is required' }, { status: 400 });
        }
        // 删除问题
        await deleteChunkByIds(chunkIds);

        return NextResponse.json({ success: true, message: 'Delete successful' });
    } catch (error) {
        console.error('Delete failed:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Delete failed' }, { status: 500 });
    }
}
