import { NextResponse } from 'next/server';
import { getProject } from '@/lib/db/projects';
import path from 'path';
import { promises as fs } from 'fs';
import { createDocument, delDocumentByIds, getDocumentsPagination } from '@/lib/db/documents';
import { getFileMD5, getProjectRoot } from '@/lib/utils/file';
import type { Documents } from '@prisma/client';
import { auth } from '@/server/auth';

type Params = Promise<{ projectId: string }>;

// 获取项目文件列表
export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        const { searchParams } = new URL(request.url);
        // 验证项目ID
        if (!projectId) {
            return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
        }
        const session = await auth();

        if (!session || !session.user || !session.user.id) {
            return new Response('Unauthorized', { status: 401 });
        }

        // const allowed = await hasProjectPermission(session.user.id, projectId, ['OWNER', 'ADMIN']);
        // if (!allowed) {
        //     return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        // }

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
}

// 删除文件
export async function DELETE(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        const { documentIds } = await request.json();

        // 验证项目ID和文件名
        if (!projectId) {
            return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
        }

        if (documentIds.length === 0) {
            return NextResponse.json({ error: 'The file name cannot be empty' }, { status: 400 });
        }

        // 获取项目信息
        const project = await getProject(projectId);
        if (!project) {
            return NextResponse.json({ error: 'The project does not exist' }, { status: 404 });
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
}

// 上传文件
export async function POST(request: Request, props: { params: Params }) {
    const params = await props.params;
    const { projectId } = params;

    // 验证项目ID
    if (!projectId) {
        console.log('The project ID cannot be empty, returning 400 error');
        return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
    }

    // 获取项目信息
    const project = await getProject(projectId);
    if (!project) {
        console.log('The project does not exist, returning 404 error');
        return NextResponse.json({ error: 'The project does not exist' }, { status: 404 });
    }

    try {
        // 保存文件
        const projectRoot = await getProjectRoot();
        const projectPath = path.join(projectRoot, projectId);
        const uploadDir = path.join(projectPath, 'files');
        const formData = await request.formData();

        // 3. 手动创建文件并处理
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
}
