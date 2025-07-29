import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { getFileMD5, getProjectRoot } from '@/lib/utils/file';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ModelConfigType, ProjectRole } from 'src/server/db/types';
import type { ApiContext } from '@/types/api-context';
import { AuditLog } from '@/lib/middleware/audit-log';
import { createImageFile, delImageByIds, getImagePagination, updateImageFile } from '@/server/db/image-file';
import type { ImageFile } from '@prisma/client';
import sharp from 'sharp';
import { getModelConfigById, getModelConfigByType } from '@/server/db/model-config';
import ModelClient from '@/lib/ai/core';
import type { ModelConfigWithProvider } from '@/lib/ai/core/types';
import { IMAGE_ANALYSIS_PROMPT } from '@/lib/ai/prompts/vision';
import { doubleCheckModelOutput } from '@/lib/utils';
import { ImageRecognitionResultSchema } from '@/lib/ai/prompts/schema';
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
