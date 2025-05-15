'use server';

import { db } from '@/server/db';
import { DEFAULT_PROVIDERS } from '@/constants/provides';

export async function getLlmProviders() {
    try {
        let list = await db.llmProviders.findMany();
        if (list.length !== 0) {
            return list;
        }
        let data = DEFAULT_PROVIDERS;
        await db.llmProviders.createMany({ data });
        return data;
    } catch (error) {
        console.error('Failed to get llmProviders in database');
        throw error;
    }
}
