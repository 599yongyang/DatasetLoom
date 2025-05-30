import { NextResponse } from 'next/server';
import { getDatasetSampleById, updateDatasetSamplePrimaryAnswer } from '@/lib/db/dataset-samples';

export async function PUT(request: Request) {
    try {
        const { dssId, questionId } = await request.json();
        if (!dssId) {
            return NextResponse.json({ error: 'DatasetSample ID cannot be empty' }, { status: 400 });
        }
        let datasetSample = await getDatasetSampleById(dssId);
        if (!datasetSample) {
            return NextResponse.json({ error: 'DatasetSample does not exist' }, { status: 404 });
        }

        await updateDatasetSamplePrimaryAnswer(dssId, questionId);

        return NextResponse.json({
            success: true,
            message: 'DatasetSample updated successfully',
            datasetSample
        });
    } catch (error) {
        console.error('Failed to update dataset-sample:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update dataset-sample' },
            { status: 500 }
        );
    }
}
