import { NextResponse } from 'next/server';
import { exportDatasetDPO, exportDatasetRaw, exportDatasetSFT, getDatasets } from '@/lib/db/datasets';
import { validateProjectId } from '@/lib/utils/api-validator';

type Params = Promise<{ projectId: string }>;

/**
 * 获取导出数据集
 */
export async function POST(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;

        const validationResult = await validateProjectId(projectId);
        if (!validationResult.success) {
            return validationResult.response;
        }
        const { dataType, confirmedOnly, includeCOT } = await request.json();

        if (dataType === 'raw') {
            const datasets = await exportDatasetRaw(projectId, confirmedOnly, includeCOT);
            return NextResponse.json(datasets);
        }
        if (dataType === 'sft') {
            const datasets = await exportDatasetSFT(projectId, confirmedOnly, includeCOT);
            return NextResponse.json(datasets);
        }
        if (dataType === 'dpo') {
            const datasets = await exportDatasetDPO(projectId, confirmedOnly);
            return NextResponse.json(datasets);
        }
        return NextResponse.json({});
    } catch (error) {
        console.error('获取数据集失败:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : '获取数据集失败'
            },
            { status: 500 }
        );
    }
}
