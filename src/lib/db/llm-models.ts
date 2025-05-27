'use server';

import { db } from '@/server/db';
import type { LlmModels } from '@prisma/client';

export async function getLlmModelsByProviderName(providerName: string) {
    try {
        return await db.llmModels.findMany({ where: { providerName } });
    } catch (error) {
        console.error('Failed to get llmModels by providerId in database');
        throw error;
    }
}

export async function createLlmModels(models: LlmModels) {
    try {
        return await db.llmModels.createMany({ data: models });
    } catch (error) {
        console.error('Failed to create llmModels in database');
        throw error;
    }
}
