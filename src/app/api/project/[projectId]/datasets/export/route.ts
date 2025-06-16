import { NextResponse } from 'next/server';
import { exportDatasetDPO, exportDatasetRaw, exportDatasetSFT } from '@/lib/db/dataset';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import { AuditLog } from '@/lib/middleware/audit-log';
import type { ApiContext } from '@/types/api-context';

/**
 * 获取导出数据集
 */
export const POST = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;

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
});
