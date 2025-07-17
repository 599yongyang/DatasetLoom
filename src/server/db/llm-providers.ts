'use server';

import { db } from '@/server/db/db';
import type { LlmProviders } from '@prisma/client';

export async function getLlmProviders(projectId: string) {
    try {
        return await db.llmProviders.findMany({ where: { projectId } });
    } catch (error) {
        console.error('Failed to get llmProviders in database');
        throw error;
    }
}

export async function checkLlmProviders(projectId: string, name: string) {
    try {
        return await db.llmProviders.findFirst({ where: { projectId, name } });
    } catch (error) {
        console.error('Failed to get llmProviders in database');
        throw error;
    }
}

export async function getLlmProviderIds(projectId: string) {
    try {
        const data = await db.llmProviders.findMany({ where: { projectId }, select: { id: true } });
        return data.map(provider => provider.id);
    } catch (error) {
        console.error('Failed to get llmProviders in database');
        throw error;
    }
}

export async function saveLlmProvider(provider: LlmProviders) {
    try {
        return await db.llmProviders.upsert({ where: { id: provider.id }, update: provider, create: provider });
    } catch (error) {
        console.error('Failed to save llmProviders in database');
        throw error;
    }
}
