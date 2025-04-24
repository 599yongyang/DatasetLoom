'use server';
import fs from 'fs';
import path from 'path';
import { db } from '@/server/db';
import type { UploadFile } from '@/schema/upload-file';

//获取文件列表
export async function getUploadFilesPagination(projectId: string, page = 1, pageSize = 10, fileName: string) {
    try {
        const whereClause = {
            projectId,
            fileName: { contains: fileName }
        };
        const [data, total] = await Promise.all([
            db.uploadFiles.findMany({
                where: whereClause,
                orderBy: {
                    createAt: 'desc'
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            db.uploadFiles.count({
                where: whereClause
            })
        ]);
        return { data, total };
    } catch (error) {
        console.error('Failed to get uploadFiles by pagination in database');
        throw error;
    }
}

export async function getUploadFileInfoById(fileId: string) {
    try {
        return await db.uploadFiles.findUnique({ where: { id: fileId } });
    } catch (error) {
        console.error('Failed to get uploadFiles by id in database');
        throw error;
    }
}

export async function getUploadFilesByProjectId(projectId: string) {
    try {
        return await db.uploadFiles.findMany({
            where: {
                projectId,
                NOT: {
                    id: {
                        in: await db.chunks
                            .findMany({
                                where: { projectId },
                                select: { fileId: true }
                            })
                            .then(chunks => chunks.map(chunk => chunk.fileId))
                    }
                }
            }
        });
    } catch (error) {
        console.error('Failed to get uploadFiles by id in database');
        throw error;
    }
}

export async function checkUploadFileInfoByMD5(projectId: string, md5: string) {
    try {
        return await db.uploadFiles.findFirst({
            where: {
                projectId,
                md5
            }
        });
    } catch (error) {
        console.error('Failed to check uploadFiles by md5 in database');
        throw error;
    }
}

export async function createUploadFileInfo(fileInfo: UploadFile) {
    try {
        return await db.uploadFiles.create({ data: fileInfo });
    } catch (error) {
        console.error('Failed to get uploadFiles by id in database');
        throw error;
    }
}

export async function delUploadFileInfoById(fileId: string) {
    try {
        const fileInfo = await db.uploadFiles.findUnique({ where: { id: fileId } });
        if (!fileInfo) return true;
        await db.uploadFiles.delete({ where: { id: fileId } });
        const projectPath = path.join(fileInfo.path, fileInfo.fileName);
        if (fileInfo.fileExt !== '.md') {
            const filePath = path.join(fileInfo.path, fileInfo.fileName.replace(/\.[^/.]+$/, '.md'));
            if (fs.existsSync(filePath)) {
                await fs.promises.rm(filePath, { recursive: true });
            }
        }
        if (fs.existsSync(projectPath)) {
            await fs.promises.rm(projectPath, { recursive: true });
        }
        return true;
    } catch (error) {
        console.error('Failed to delete uploadFiles by id in database');
        throw error;
    }
}
