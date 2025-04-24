import { NextResponse } from 'next/server';
import { getProject, updateProject } from '@/lib/db/projects';
import path from 'path';
import { promises as fs } from 'fs';
import {
    checkUploadFileInfoByMD5,
    createUploadFileInfo,
    delUploadFileInfoById,
    getUploadFilesPagination
} from '@/lib/db/upload-files';
import { ensureDir, getFileMD5, getProjectRoot } from '@/lib/utils/file';
import { saveChunks } from '@/lib/db/chunks';
import { type Chunks } from '@prisma/client';
import { chunker } from '@/lib/chunker';
type Params = Promise<{ projectId: string }>;

// 获取项目文件列表
export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;

        // 验证项目ID
        if (!projectId) {
            return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
        }

        // 获取文件列表
        const files = await getUploadFilesPagination(projectId, 1, 10, '');

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
        const { searchParams } = new URL(request.url);
        const fileId = searchParams.get('fileId');

        // 验证项目ID和文件名
        if (!projectId) {
            return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
        }

        if (!fileId) {
            return NextResponse.json({ error: 'The file name cannot be empty' }, { status: 400 });
        }

        // 获取项目信息
        const project = await getProject(projectId);
        if (!project) {
            return NextResponse.json({ error: 'The project does not exist' }, { status: 404 });
        }
        await delUploadFileInfoById(fileId);
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
    console.log('Project information retrieved successfully:', project.name || project.id);

    try {
        const formData = await request.formData();
        const fileName = formData.get('fileName') as string;
        const file = formData.get('file') as File;

        // 验证文件名和文件
        if (!fileName || !file) {
            return NextResponse.json({ error: 'File name or file content is missing' }, { status: 400 });
        }

        // 直接从请求体中读取二进制数据
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // 保存文件
        const projectRoot = await getProjectRoot();
        const projectPath = path.join(projectRoot, projectId);
        const filesDir = path.join(projectPath, 'files');

        await ensureDir(filesDir);

        const filePath = path.join(filesDir, fileName);
        await fs.writeFile(filePath, fileBuffer);
        //获取文件大小
        const stats = await fs.stat(filePath);
        //获取文件md5
        const md5 = (await getFileMD5(filePath)) as string;
        console.log(md5, 'md3');
        //获取文件扩展名
        const ext = path.extname(filePath);

        let res = await checkUploadFileInfoByMD5(projectId, md5);
        if (res) {
            return NextResponse.json({ error: `【${fileName}】该文件已在此项目中存在` }, { status: 400 });
        }

        let fileInfo = await createUploadFileInfo({
            projectId,
            fileName,
            size: stats.size,
            md5,
            fileExt: ext,
            path: filesDir
        });

        let chunks = await chunker(filePath, ext, { maxChunkSize: 3000 });
        console.log(chunks);

        let data = chunks.map((text, index) => {
            const chunkId = `${path.basename(fileName, path.extname(fileName))}-part-${index + 1}`;
            return {
                projectId,
                name: chunkId,
                fileId: fileInfo.id,
                fileName: fileName,
                content: text,
                summary: text,
                size: text.length
            };
        });

        let chunkRes = await saveChunks(data as Chunks[]);

        return NextResponse.json(fileInfo);
    } catch (error) {
        console.error('Error processing file upload:', error);
        return NextResponse.json(
            { error: 'File upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    }
}
