'use server';
import { db } from '@/server/db';
import type { Documents } from '@prisma/client';

//获取文件列表
export async function getDocumentsPagination(
    projectId: string,
    page = 1,
    pageSize = 10,
    fileName: string,
    fileExt: string
) {
    try {
        const whereClause = {
            projectId,
            fileName: { contains: fileName },
            fileExt: { contains: fileExt }
        };
        const [data, total] = await Promise.all([
            db.documents.findMany({
                where: whereClause,
                orderBy: {
                    createdAt: 'desc'
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            db.documents.count({
                where: whereClause
            })
        ]);
        return { data, total };
    } catch (error) {
        console.error('Failed to get Documents by pagination in database');
        throw error;
    }
}

export async function getDocumentById(fileId: string) {
    try {
        return await db.documents.findUnique({ where: { id: fileId } });
    } catch (error) {
        console.error('Failed to get Documents by id in database');
        throw error;
    }
}

export async function getDocumentByIds(fileId: string[]) {
    try {
        return await db.documents.findMany({ where: { id: { in: fileId } } });
    } catch (error) {
        console.error('Failed to get Documents by id in database');
        throw error;
    }
}

export async function getDocumentsByProjectId(projectId: string) {
    try {
        return await db.documents.findMany({
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
        console.error('Failed to get Documents by id in database');
        throw error;
    }
}

export async function checkDocumentByMD5(projectId: string, md5: string) {
    try {
        return await db.documents.findFirst({
            where: {
                projectId,
                md5
            }
        });
    } catch (error) {
        console.error('Failed to check Documents by md5 in database');
        throw error;
    }
}

export async function createDocument(document: Documents) {
    try {
        return await db.documents.create({ data: document });
    } catch (error) {
        console.error('Failed to get Documents by id in database');
        throw error;
    }
}

export async function delDocumentByIds(fileId: string[]) {
    try {
        return await db.documents.deleteMany({ where: { id: { in: fileId } } });
    } catch (error) {
        console.error('Failed to delete Documents by id in database');
        throw error;
    }
}
