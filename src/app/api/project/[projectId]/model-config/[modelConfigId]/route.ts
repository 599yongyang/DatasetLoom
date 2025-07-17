import { NextResponse } from 'next/server';
import { deleteModelConfigById, updateModelConfigDefault, updateModelConfigStatus } from '@/server/db/model-config';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from 'src/server/db/types';
import { AuditLog } from '@/lib/middleware/audit-log';
import type { ApiContext } from '@/types/api-context';

/**
 * 删除模型配置
 */
export const DELETE = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { modelConfigId } = context;
        await deleteModelConfigById(modelConfigId);
        return NextResponse.json(true);
    } catch (error) {
        console.error('Error obtaining model configuration:', error);
        return NextResponse.json({ error: 'Failed to obtain model configuration' }, { status: 500 });
    }
});

/**
 * 更新模型配置
 */
export const PUT = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { modelConfigId } = context;
        const { status } = await request.json();
        await updateModelConfigStatus(modelConfigId, status);
        return NextResponse.json(true);
    } catch (error) {
        console.error('Error update model configuration:', error);
        return NextResponse.json({ error: 'Failed to update model configuration' }, { status: 500 });
    }
});

/**
 * 设置模型配置为默认
 */
export const PATCH = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { modelConfigId } = context;
        await updateModelConfigDefault(modelConfigId);
        return NextResponse.json(true);
    } catch (error) {
        console.error('Error update model configuration:', error);
        return NextResponse.json({ error: 'Failed to update model configuration' }, { status: 500 });
    }
});
