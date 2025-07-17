import { NextResponse } from 'next/server';
import { getFileMD5, getProjectRoot } from '@/lib/utils/file';
import path from 'path';
import { promises as fs } from 'fs';
import { checkDocumentByMD5, createDocument } from '@/server/db/documents';
import type { Documents, ParserConfig } from '@prisma/client';
import { getParserConfig } from '@/server/db/parser-config';
import { createParser } from '@/lib/parser/parser-factory';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from 'src/server/db/types';
import { AuditLog } from '@/lib/middleware/audit-log';
import type { ApiContext } from '@/types/api-context';

/**
 * 文档解析
 */
export const POST = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    const { projectId } = context;

    const formData = await request.formData();
    // 获取参数
    const sourceType = formData.get('sourceType')?.toString().trim() || '';
    const selectedService = formData.get('selectedService')?.toString().trim() || '';
    const localFiles = formData.getAll('localFiles') as File[];
    const webFileUrls = formData.get('webFileUrls')?.toString().trim() || '';
    let webUrls = formData.get('webUrls')?.toString().trim() || '';
    webUrls = JSON.parse(webUrls || '[]');

    const projectRoot = await getProjectRoot();
    const uploadDir = path.join(projectRoot, projectId, 'files');

    // 确保目录存在
    try {
        await fs.access(uploadDir);
    } catch {
        await fs.mkdir(uploadDir, { recursive: true });
    }
    let parser = createParser({ serviceId: selectedService } as ParserConfig);
    if (selectedService !== 'native') {
        const parserConfig = await getParserConfig(projectId, selectedService);
        if (!parserConfig) {
            return NextResponse.json({ success: false, message: '请先配置解析服务配置' }, { status: 400 });
        }
        parser = createParser(parserConfig);
    }

    const fileIds: string[] = [];

    // 处理本地文件上传
    if (sourceType === 'local') {
        if (!Array.isArray(localFiles) || localFiles.length <= 0) {
            return NextResponse.json({ success: false, message: '请选择文件' }, { status: 400 });
        }

        for (const file of localFiles) {
            try {
                const fileBuffer = Buffer.from(await file.arrayBuffer());
                const originalName = file.name || 'unnamed-file';
                const fileExt = path.extname(originalName);
                const baseName = path.basename(originalName, fileExt);
                const uniqueFileName = `${baseName}-${Date.now()}${fileExt}`;
                const filePath = path.join(uploadDir, uniqueFileName);

                // 写入原始文件
                await fs.writeFile(filePath, fileBuffer);
                const md5 = (await getFileMD5(filePath)) ?? '';

                const doc = await checkDocumentByMD5(projectId, md5);
                if (doc) {
                    fileIds.push(doc.id);
                    continue;
                }
                let parserFilePath = '';
                let parserFileExt = '';
                let parserFileSize = 0;

                const parseResult = await parser.parse({
                    filePath: filePath,
                    fileName: originalName,
                    pdf: fileBuffer.toString('base64')
                });

                const parsedFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.md`;
                parserFilePath = path.join(uploadDir, parsedFileName);
                await fs.writeFile(parserFilePath, parseResult);

                const stats = await fs.stat(parserFilePath);
                parserFileExt = '.md';
                parserFileSize = stats.size;

                // 创建文档记录
                const document = await createDocument({
                    projectId,
                    fileName: originalName,
                    size: fileBuffer.length,
                    md5,
                    fileExt,
                    path: filePath,
                    sourceType,
                    parserFilePath,
                    parserFileExt,
                    parserFileSize
                } as Documents);

                fileIds.push(document.id);
            } catch (error) {
                console.error(`文件处理失败: ${error}`);
                return NextResponse.json(
                    { success: false, message: `文件处理失败: ${(error as Error).message}` },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true, data: fileIds });
    }

    // 处理网页 URL 解析
    if (sourceType === 'webUrl') {
        if (!Array.isArray(webUrls) || webUrls.length === 0) {
            return NextResponse.json({ success: false, message: '请输入网址' }, { status: 400 });
        }

        for (const url of webUrls) {
            try {
                const result = await parser.parse({ url });
                const parsedFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.md`;
                const parserFilePath = path.join(uploadDir, parsedFileName);
                await fs.writeFile(parserFilePath, result);

                const stats = await fs.stat(parserFilePath);

                const document = await createDocument({
                    projectId,
                    fileName: url,
                    sourceType,
                    parserFilePath,
                    parserFileExt: '.md',
                    parserFileSize: stats.size
                } as Documents);

                fileIds.push(document.id);
            } catch (error) {
                console.error(`URL 解析失败: ${url}`, error);
                return NextResponse.json(
                    { success: false, message: `解析失败: ${(error as Error).message}` },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true, message: '解析完成', data: fileIds });
    }

    return NextResponse.json({ success: false, message: '未知的来源类型' }, { status: 400 });
});
