import { NextResponse } from 'next/server';
import { deleteDataset, getDatasetsById, updateDataset } from '@/lib/db/datasets';
import type { Datasets } from '@prisma/client';

type Params = Promise<{ projectId: string; datasetId: string }>;

export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId, datasetId } = params;
        // 验证项目ID
        if (!projectId) {
            return NextResponse.json({ error: '项目ID不能为空' }, { status: 400 });
        }
        if (!datasetId) {
            return NextResponse.json({ error: '数据集ID不能为空' }, { status: 400 });
        }
        const datasets = await getDatasetsById(datasetId);
        return NextResponse.json(datasets);
    } catch (error) {
        console.error('获取数据集详情失败:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : '获取数据集详情失败'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { datasetId } = params;
        if (!datasetId) {
            return NextResponse.json(
                {
                    error: 'Dataset ID cannot be empty'
                },
                { status: 400 }
            );
        }

        await deleteDataset(datasetId);

        return NextResponse.json({
            success: true,
            message: 'Dataset deleted successfully'
        });
    } catch (error) {
        console.error('Failed to delete dataset:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to delete dataset'
            },
            { status: 500 }
        );
    }
}

/**
 * 编辑数据集
 */
export async function PUT(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { datasetId } = params;
        const { answer, cot } = await request.json();
        if (!datasetId) {
            return NextResponse.json(
                {
                    error: 'Dataset ID cannot be empty'
                },
                { status: 400 }
            );
        }
        let dataset = await getDatasetsById(datasetId);
        if (!dataset) {
            return NextResponse.json({ error: 'Dataset does not exist' }, { status: 404 });
        }

        let data = { id: datasetId } as Datasets;
        if (answer) data.answer = answer;
        if (cot) data.cot = cot;
        // 保存更新后的数据集列表
        await updateDataset(data);

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
