import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { AuditLog } from '@/lib/middleware/audit-log';
import { ProjectRole } from 'src/server/db/types';
import type { ApiContext } from '@/types/api-context';
import { NextResponse } from 'next/server';
import type { ImageBlock } from '@prisma/client';
import { createImageBlock, deleteImageBlock, getImageBlockPagination } from '@/server/db/image-block';

/**
 * 保存图像标注分块
 */
export const POST = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const { imageId, annotations }: { imageId: string; annotations: ImageBlock[] } = await request.json();
        if (annotations.length === 0 || !imageId) {
            return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
        }
        const data = annotations.map(item => {
            return {
                ...item,
                projectId,
                imageId,
                x: Math.floor(item.x),
                y: Math.floor(item.y),
                width: Math.floor(item.width),
                height: Math.floor(item.height)
            };
        });

        await createImageBlock(data);

        return NextResponse.json({ message: 'success' });
    } catch (error) {
        console.error('Error save parserConfig:', error);
        return NextResponse.json({ error: 'Failed to save parserConfig' }, { status: 500 });
    }
});

export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const { searchParams } = new URL(request.url);

        // 获取文件列表
        const files = await getImageBlockPagination(
            projectId,
            parseInt(searchParams.get('page') ?? '1'),
            parseInt(searchParams.get('size') ?? '10'),
            searchParams.get('label') ?? ''
        );

        return NextResponse.json(files);
    } catch (error) {
        console.error('Error obtaining file list:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error obtaining file list' },
            { status: 500 }
        );
    }
});

export const DELETE = compose(AuthGuard(ProjectRole.ADMIN))(async (request: Request, context: ApiContext) => {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const type = searchParams.get('type');

        if (!id || !type) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }
        await deleteImageBlock(id, type);
        return NextResponse.json({ message: 'Success' });
    } catch (error) {
        console.error('Error obtaining file list:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error obtaining file list' },
            { status: 500 }
        );
    }
});
