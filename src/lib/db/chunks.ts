'use server';
import { db } from '@/server/db';
import type { Chunks } from '@prisma/client';

export async function saveChunks(chunks: Chunks[]) {
    try {
        return await db.chunks.createManyAndReturn({ data: chunks });
    } catch (error) {
        console.error('Failed to create chunks in database');
        throw error;
    }
}

export async function getChunkById(chunkId: string) {
    try {
        return await db.chunks.findUnique({
            where: { id: chunkId },
            include: { ChunkMetadata: true, ChunkEntities: true }
        });
    } catch (error) {
        console.error('Failed to get chunks by id in database');
        throw error;
    }
}

export async function getChunkByIds(chunkIds: string[]) {
    try {
        return await db.chunks.findMany({ where: { id: { in: chunkIds } }, include: { ChunkMetadata: true } });
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

export async function getChunksPagination(
    projectId: string,
    page = 1,
    pageSize = 10,
    status?: string,
    fileIds?: string[]
) {
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
        if (status === 'generated') {
            whereClause.Questions = {
                some: {}
            };
        } else if (status === 'ungenerated') {
            whereClause.Questions = {
                none: {}
            };
        }
        if (fileIds && fileIds.length > 0) {
            whereClause.fileId = { in: fileIds };
        }
        const [data, total] = await Promise.all([
            db.chunks.findMany({
                where: whereClause,
                include: {
                    Questions: {
                        select: {
                            question: true
                        }
                    },
                    ChunkMetadata: {
                        select: {
                            domain: true,
                            subDomain: true,
                            summary: true,
                            tags: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            db.chunks.count({
                where: whereClause
            })
        ]);
        return { data, total };
    } catch (error) {
        console.error('Failed to get chunks by pagination in database');
        throw error;
    }
}

export async function deleteChunkByIds(chunkId: string[]) {
    try {
        return await db.chunks.deleteMany({ where: { id: { in: chunkId } } });
    } catch (error) {
        console.error('Failed to delete chunks by id in database');
        throw error;
    }
}

export async function updateChunkById(chunkId: string, chunkData: Chunks, tags?: string) {
    try {
        // 只有在 tags 存在时才更新 metadata
        const updateOperations: any = [
            db.chunks.update({
                where: { id: chunkId },
                data: chunkData
            })
        ];
        if (tags) {
            updateOperations.push(
                db.chunkMetadata.update({
                    where: { chunkId },
                    data: { tags }
                })
            );
        }
        // 执行事务
        return await db.$transaction(updateOperations);
    } catch (error) {
        console.error('Failed to update chunks by id in database');
        throw error;
    }
}

export async function mergeChunks(sourceId: string, targetId: string) {
    try {
        // 获取 source 和 target chunk
        const [sourceChunk, targetChunk] = await Promise.all([
            db.chunks.findUnique({ where: { id: sourceId } }),
            db.chunks.findUnique({ where: { id: targetId } })
        ]);

        if (!sourceChunk || !targetChunk) {
            throw new Error(`One or both chunks not found (source: ${sourceId}, target: ${targetId})`);
        }

        // 确保不是合并到自己
        if (sourceId === targetId) {
            throw new Error('Cannot merge a chunk into itself');
        }

        // 合并内容（你可以根据业务需要自定义合并策略）
        const mergedContent = `${targetChunk.content}\n\n${sourceChunk.content}`;

        const result = await db.$transaction(async tx => {
            // 更新目标 chunk 内容
            const updatedTarget = await tx.chunks.update({
                where: { id: targetId },
                data: { content: mergedContent, size: mergedContent.length }
            });

            await tx.questions.updateMany({ where: { chunkId: sourceId }, data: { chunkId: targetId } });

            // 删除 source chunk
            await tx.chunks.delete({ where: { id: sourceId } });

            return {
                mergedChunk: updatedTarget,
                deletedChunkId: sourceId
            };
        });

        return result;
    } catch (error) {
        console.error('Failed to merge chunks:', error);
        throw new Error(`Chunk merging failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
