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

/**
 * 获取图片(知识库)列表
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const { searchParams } = new URL(request.url);

        // 获取文件列表
        const files = await getImagePagination(
            projectId,
            parseInt(searchParams.get('page') ?? '1'),
            parseInt(searchParams.get('size') ?? '10'),
            searchParams.get('fileName') ?? '',
            Boolean(searchParams.get('block')) ?? false
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

/**
 * 删除图片(知识库)
 */
export const DELETE = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request) => {
    try {
        const { imagesIds } = await request.json();
        // 验证文件
        if (imagesIds.length === 0) {
            return NextResponse.json({ error: 'The file name cannot be empty' }, { status: 400 });
        }
        await delImageByIds(imagesIds);
        return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error deleting file' },
            { status: 500 }
        );
    }
});
/**
 * 文件上传
 */
export const POST = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const { searchParams } = new URL(request.url);
        const mid = searchParams.get('mid');
        if (!mid) {
            return NextResponse.json({ error: '请选择模型' }, { status: 400 });
        }
        const modelConfig = await getModelConfigById(mid);
        if (!modelConfig) {
            return NextResponse.json({ error: '模型配置不存在' }, { status: 500 });
        }

        const projectRoot = await getProjectRoot();
        const projectPath = path.join(projectRoot, projectId);
        const uploadDir = path.join(projectPath, 'files');
        const formData = await request.formData();
        // 文件处理
        const files = [];
        for (const [fieldName, fieldValue] of formData.entries()) {
            if (fieldValue instanceof Blob) {
                const fileBuffer = Buffer.from(await fieldValue.arrayBuffer());
                const fileName = fieldValue.name || `${Date.now()}-${Math.random().toString(36).substring(2)}`;
                const fileExt = path.extname(fileName);
                const uniqueFileName = `${path.basename(fileName, fileExt)}-${Date.now()}${fileExt}`;
                const filePath = path.join(uploadDir, uniqueFileName);

                await fs.writeFile(filePath, fileBuffer);
                // 获取图片宽高
                const image = sharp(fileBuffer);
                const { width, height } = await image.metadata();

                let fileInfo = await createImageFile({
                    projectId,
                    fileName: fileName,
                    width: width,
                    height: height,
                    size: fileBuffer.length,
                    url: filePath
                } as ImageFile);
                files.push(fileInfo);

                setTimeout(() => {
                    processImageAnalysis(fileInfo.id, modelConfig, fileBuffer);
                }, 0);
            }
        }

        return NextResponse.json({
            success: true,
            message: '文件上传成功',
            files
        });
    } catch (error) {
        console.error('Error processing file upload:', error);
        return NextResponse.json(
            { error: 'File upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    }
});

const processImageAnalysis = async (id: string, modelConfig: ModelConfigWithProvider, fileBuffer: Buffer) => {
    try {
        const modelClient = new ModelClient(modelConfig);
        const { text } = await modelClient.vision(fileBuffer, IMAGE_ANALYSIS_PROMPT);
        const modelOutput = await doubleCheckModelOutput(text, ImageRecognitionResultSchema);
        await updateImageFile(id, {
            tags: modelOutput.entities ? modelOutput.entities.join(',') : '',
            ocrText: modelOutput.text || '',
            status: 'DONE'
        } as ImageFile);
    } catch (error) {
        console.error('Error during image analysis:', error);
    }
};
