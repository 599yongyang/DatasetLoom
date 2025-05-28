import { NextResponse } from 'next/server';
import { getDatasets, getDatasetsById, updateDataset, updateDatasetPrimaryAnswer } from '@/lib/db/datasets';
import type { Datasets } from '@prisma/client';

export async function PUT(request: Request) {
    try {
        const { datasetId, questionId } = await request.json();
        if (!datasetId) {
            return NextResponse.json({ error: 'Dataset ID cannot be empty' }, { status: 400 });
        }
        let dataset = await getDatasetsById(datasetId);
        if (!dataset) {
            return NextResponse.json({ error: 'Dataset does not exist' }, { status: 404 });
        }

        await updateDatasetPrimaryAnswer(datasetId, questionId);

        return NextResponse.json({
            success: true,
            message: 'Dataset updated successfully',
            dataset: dataset
        });
    } catch (error) {
        console.error('Failed to update dataset:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update dataset' },
            { status: 500 }
        );
    }
}
