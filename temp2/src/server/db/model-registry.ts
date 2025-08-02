'use server';

import { db } from '@/server/db/db';
import type { ModelRegistry } from '@prisma/client';

export async function getModelRegistryByProviderName(providerName: string) {
    try {
        return await db.modelRegistry.findMany({ where: { providerName } });
    } catch (error) {
        console.error('Failed to get modelRegistry by providerName in database');
        throw error;
    }
}

export async function createModelRegistry(models: ModelRegistry) {
    try {
        return await db.modelRegistry.createMany({ data: models });
    } catch (error) {
        console.error('Failed to create modelRegistry in database');
        throw error;
    }
}
