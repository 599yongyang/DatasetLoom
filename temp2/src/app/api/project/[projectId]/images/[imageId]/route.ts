import { NextResponse } from 'next/server';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from 'src/server/db/types';
import type { ApiContext } from '@/types/api-context';
import { getBlockListByImageId } from '@/server/db/image-block';

/**
 * 获取图片标注分块列表
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { imageId } = context;
        const data = await getBlockListByImageId(imageId);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error obtaining file list:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error obtaining file list' },
            { status: 500 }
        );
    }
});
