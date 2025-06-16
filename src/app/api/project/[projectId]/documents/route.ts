import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { createDocument, delDocumentByIds, getDocumentsPagination } from '@/lib/db/documents';
import { getFileMD5, getProjectRoot } from '@/lib/utils/file';
import type { Documents } from '@prisma/client';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import type { ApiContext } from '@/types/api-context';
import { AuditLog } from '@/lib/middleware/audit-log';

/**
 * 获取文档(知识库)列表
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const { searchParams } = new URL(request.url);

        // 获取文件列表
        const files = await getDocumentsPagination(
            projectId,
            parseInt(searchParams.get('page') ?? '1'),
            parseInt(searchParams.get('size') ?? '10'),
            searchParams.get('fileName') ?? '',
            searchParams.get('fileExt') ?? ''
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
 * 删除文档(知识库)
 */
export const DELETE = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request) => {
    try {
        const { documentIds } = await request.json();
        // 验证文件
        if (documentIds.length === 0) {
            return NextResponse.json({ error: 'The file name cannot be empty' }, { status: 400 });
        }
        await delDocumentByIds(documentIds);
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
                const md5 = (await getFileMD5(filePath)) ?? '';

                let fileInfo = await createDocument({
                    projectId,
                    fileName: fileName,
                    size: fileBuffer.length,
                    md5,
                    fileExt: fileExt,
                    path: filePath
                } as Documents);
                files.push(fileInfo);
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
