'use server';

import { db } from '@/server/db/db';
import type { ModelProviders } from '@prisma/client';

export async function getModelProviders(projectId: string) {
    try {
        return await db.modelProviders.findMany({ where: { projectId } });
    } catch (error) {
        console.error('Failed to get modelProviders in database');
        throw error;
    }
}

export async function checkModelProviders(projectId: string, name: string) {
    try {
        return await db.modelProviders.findFirst({ where: { projectId, name } });
    } catch (error) {
        console.error('Failed to get modelProviders in database');
        throw error;
    }
}

export async function getModelProviderIds(projectId: string) {
    try {
        const data = await db.modelProviders.findMany({ where: { projectId }, select: { id: true } });
        return data.map(provider => provider.id);
    } catch (error) {
        console.error('Failed to get modelProviders in database');
        throw error;
    }
}

export async function saveModelProvider(provider: ModelProviders) {
    try {
        return await db.modelProviders.upsert({ where: { id: provider.id }, update: provider, create: provider });
    } catch (error) {
        console.error('Failed to save modelProviders in database');
        throw error;
    }
}
