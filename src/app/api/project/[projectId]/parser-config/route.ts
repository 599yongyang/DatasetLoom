import { NextResponse } from 'next/server';
import { type ParserConfig } from '@prisma/client';
import { checkParserConfig, createParserConfig, getParserConfigList, updateParserConfig } from '@/lib/db/parser-config';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import type { ApiContext } from '@/types/api-context';
import { AuditLog } from '@/lib/middleware/audit-log';

/**
 * 获取解析服务配置列表
 */
export const GET = compose(AuthGuard(ProjectRole.ADMIN))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        let parserConfigList = await getParserConfigList(projectId);
        return NextResponse.json(parserConfigList);
    } catch (error) {
        console.error('Error get parserConfig List:', error);
        return NextResponse.json({ error: 'Failed to get parserConfig List' }, { status: 500 });
    }
});

/**
 * 保存解析服务配置
 */
export const POST = compose(
    AuthGuard(ProjectRole.ADMIN),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        const { serviceId, serviceName, apiUrl, apiKey } = await request.json();
        const parserConfig = await checkParserConfig(projectId, serviceId);
        if (parserConfig) {
            await updateParserConfig({ ...parserConfig, apiUrl, apiKey });
        } else {
            await createParserConfig({
                projectId,
                serviceName,
                serviceId,
                apiUrl,
                apiKey,
                status: true
            } as ParserConfig);
        }
        return NextResponse.json({ message: 'success' });
    } catch (error) {
        console.error('Error save parserConfig:', error);
        return NextResponse.json({ error: 'Failed to save parserConfig' }, { status: 500 });
    }
});
