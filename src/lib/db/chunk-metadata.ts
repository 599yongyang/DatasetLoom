'use server';
import { db } from '@/server/db';
import type { ChunkMetadata } from '@prisma/client';

export async function insertChunkMetadata(chunks: ChunkMetadata[]) {
    try {
        return await db.chunkMetadata.createMany({ data: chunks });
    } catch (error) {
        console.error('Failed to create chunkMetadata in database');
        throw error;
    }
}

export async function getChunkDomain(projectId: string, level: 'domain' | 'subDomain' = 'domain') {
    try {
        // 获取当前项目的所有 ChunkMetadata 总数
        const totalCount = await db.chunkMetadata.count({
            where: {
                chunk: {
                    projectId
                }
            }
        });
        if (totalCount === 0) {
            return [];
        }
        const domainCounts = await db.chunkMetadata.groupBy({
            by: [level],
            _count: {
                id: true
            },
            where: {
                chunk: {
                    projectId
                }
            }
        });
        const result = domainCounts.map(item => {
            const percentage = ((item._count.id / totalCount) * 100).toFixed(1);
            return {
                domain: level === 'domain' ? item.domain : item.subDomain,
                count: item._count.id,
                value: parseFloat(percentage)
            };
        });

        return result;
    } catch (error) {
        console.error('Failed to get chunkMetadata in database');
        throw error;
    }
}
