'use server';
import { db } from '@/server/db';
import type { Chunks } from '@prisma/client';

export async function saveChunks(chunks: Chunks[]) {
    try {
        return await db.chunks.createMany({ data: chunks });
    } catch (error) {
        console.error('Failed to create chunks in database');
        throw error;
    }
}

export async function getChunkById(chunkId: string) {
    try {
        return await db.chunks.findUnique({ where: { id: chunkId } });
    } catch (error) {
        console.error('Failed to get chunks by id in database');
        throw error;
    }
}

export async function getChunkByIds(chunkIds: string[]) {
    try {
        return await db.chunks.findMany({ where: { id: { in: chunkIds } } });
    } catch (error) {
        console.error('Failed to get chunks by id in database');
        throw error;
    }
}

export async function getChunksByFileIds(fileIds: string[]) {
    try {
        return await db.chunks.findMany({
            where: { fileId: { in: fileIds } },
            include: {
                Questions: {
                    select: {
                        question: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Failed to get chunks by id in database');
        throw error;
    }
}

// 获取项目中所有Chunks
export async function getChunkByProjectId(projectId: string, filter?: string, fileIds?: string[]) {
    try {
        const whereClause: {
            projectId: string;
            fileId?: {
                in?: string[];
            };
            Questions?: {
                some?: Record<string, never>;
                none?: Record<string, never>;
            };
        } = {
            projectId
        };
        if (filter === 'generated') {
            whereClause.Questions = {
                some: {}
            };
        } else if (filter === 'ungenerated') {
            whereClause.Questions = {
                none: {}
            };
        }
        if (fileIds && fileIds.length > 0) {
            whereClause.fileId = { in: fileIds };
        }
        return await db.chunks.findMany({
            where: whereClause,
            include: {
                Questions: {
                    select: {
                        question: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Failed to get chunks by projectId in database');
        throw error;
    }
}

export async function deleteChunkById(chunkId: string) {
    try {
        const delQuestions = db.questions.deleteMany({ where: { chunkId } });
        const delChunk = db.chunks.delete({ where: { id: chunkId } });
        return await db.$transaction([delQuestions, delChunk]);
    } catch (error) {
        console.error('Failed to delete chunks by id in database');
        throw error;
    }
}

export async function updateChunkById(chunkId: string, chunkData: Chunks) {
    try {
        return await db.chunks.update({ where: { id: chunkId }, data: chunkData });
    } catch (error) {
        console.error('Failed to update chunks by id in database');
        throw error;
    }
}
