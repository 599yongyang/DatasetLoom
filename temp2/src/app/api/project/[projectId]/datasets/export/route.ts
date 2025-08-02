import { NextResponse } from 'next/server';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from 'src/server/db/types';
import { AuditLog } from '@/lib/middleware/audit-log';
import type { ApiContext } from '@/types/api-context';
import { exportDataset, getExportDataset } from '@/app/api/project/[projectId]/datasets/export/serivce';
import fs from 'fs/promises';

/**
 * 获取导出数据集
 */
export const POST = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;

        const { contextType, fileFormat, dataType, confirmedOnly, includeCOT, exportType } = await request.json();
        if (exportType === 'HF') {
            const dataset = await getExportDataset({
                contextType,
                fileFormat,
                dataType,
                confirmedOnly,
                projectId,
                exportType
            });
            return NextResponse.json(dataset);
        }

        const result = await exportDataset({
            projectId,
            contextType,
            fileFormat,
            dataType,
            confirmedOnly,
            includeCOT,
            exportType
        });

        if (result.filePath) {
            const file = await fs.readFile(result.filePath);
            return new NextResponse(file, {
                headers: {
                    'Content-Type': 'application/zip',
                    'Content-Disposition': `attachment; filename=${result.filename}`
                }
            });
        }
        return NextResponse.json(result);
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
