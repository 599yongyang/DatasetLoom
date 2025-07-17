import { db } from '@/server/db/db';
import type { PreferencePair } from '@prisma/client';

export async function updatePreferencePair(data: PreferencePair) {
    try {
        return await db.preferencePair.update({
            data,
            where: {
                id: data.id
            }
        });
    } catch (error) {
        console.error('Failed to update PreferencePair in database');
        throw error;
    }
}

export async function insertPreferencePair(data: PreferencePair) {
    try {
        return await db.preferencePair.create({ data });
    } catch (error) {
        console.error('Failed to insert PreferencePair in database');
        throw error;
    }
}

export async function checkPreferencePair(projectId: string, questionId: string) {
    try {
        return await db.preferencePair.findFirst({ where: { projectId, questionId } });
    } catch (error) {
        console.error('Failed to check PreferencePair in database');
        throw error;
    }
}

export async function getPreferencePair(projectId: string, questionId: string) {
    try {
        return await db.datasetSamples.findMany({
            where: { questionId, projectId },
            orderBy: { confidence: 'desc' },
            take: 2
        });
    } catch (error) {
        console.error('Failed to get PreferencePair in database');
        throw error;
    }
}
