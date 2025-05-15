'use server';
import { db } from '@/server/db';
import type { ChunkMetadata } from '@prisma/client';

export async function insertChunkMetadata(chunks: ChunkMetadata[]) {
    try {
        return await db.chunkMetadata.createMany({ data: chunks });
    } catch (error) {
        console.error('Failed to create chunks in database');
        throw error;
    }
}
