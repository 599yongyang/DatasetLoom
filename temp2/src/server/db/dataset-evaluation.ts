import { db } from '@/server/db/db';
import type { DatasetEvaluation } from '@prisma/client';

export async function getDatasetEvalList(sampleId: string, sampleType: string) {
    try {
        return await db.datasetEvaluation.findMany({
            where: { sampleId, sampleType }
        });
    } catch (error) {
        console.error('Failed to get datasets by id in database');
        throw error;
    }
}

export async function createDatasetEval(data: DatasetEvaluation) {
    try {
        return await db.datasetEvaluation.create({
            data
        });
    } catch (error) {
        console.error('Failed to create dataset in database');
        throw error;
    }
}
