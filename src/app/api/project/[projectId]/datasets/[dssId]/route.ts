import { NextResponse } from 'next/server';
import { deleteDatasetSample, getDatasetSampleById, updateDatasetSample } from '@/server/db/dataset-samples';
import type { DatasetSamples } from '@prisma/client';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from 'src/server/db/types';
import type { ApiContext } from '@/types/api-context';
import { AuditLog } from '@/lib/middleware/audit-log';

/**
 * 获取数据集样本详情
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { dssId } = context;
        // 验证项目ID
        if (!dssId) {
            return NextResponse.json({ error: 'DatasetSample ID cannot be empty' }, { status: 400 });
        }
        const datasets = await getDatasetSampleById(dssId);
        return NextResponse.json(datasets);
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Get DatasetSample Error'
            },
            { status: 500 }
        );
    }
});

/**
 * 删除数据集样本
 */
export const DELETE = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { dssId } = context;
        if (!dssId) {
            return NextResponse.json({ error: 'DatasetSample ID cannot be empty' }, { status: 400 });
        }

        await deleteDatasetSample(dssId);

        return NextResponse.json({
            success: true,
            message: 'DatasetSample deleted successfully'
        });
    } catch (error) {
        console.error('Failed to delete dataset-sample:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to delete dataset-sample'
            },
            { status: 500 }
        );
    }
});

/**
 * 编辑数据集样本
 */
export const PUT = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { dssId } = context;
        const { answer, cot } = await request.json();
        if (!dssId) {
            return NextResponse.json({ error: 'DatasetSample ID cannot be empty' }, { status: 400 });
        }
        let dss = await getDatasetSampleById(dssId);
        if (!dss) {
            return NextResponse.json({ error: 'DatasetSample does not exist' }, { status: 404 });
        }

        let data = { id: dssId } as DatasetSamples;
        if (answer) data.answer = answer;
        if (cot) data.cot = cot;
        // 保存更新后的数据集列表
        await updateDatasetSample(data);

        return NextResponse.json({
            success: true,
            message: 'DatasetSample updated successfully',
            dss: dss
        });
    } catch (error) {
        console.error('Failed to update dataset-sample:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update dataset-sample' },
            { status: 500 }
        );
    }
});
