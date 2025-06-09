import { NextResponse } from 'next/server';
import { type ParserConfig } from '@prisma/client';
import { validateProjectId } from '@/lib/utils/api-validator';
import { checkParserConfig, createParserConfig, getParserConfigList, updateParserConfig } from '@/lib/db/parser-config';

type Params = Promise<{ projectId: string }>;

// 获取解析服务配置列表
export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        const validationResult = await validateProjectId(projectId);
        if (!validationResult.success) {
            return validationResult.response;
        }
        let parserConfigList = await getParserConfigList(projectId);
        return NextResponse.json(parserConfigList);
    } catch (error) {
        console.error('Error get parserConfig List:', error);
        return NextResponse.json({ error: 'Failed to get parserConfig List' }, { status: 500 });
    }
}

// 保存解析服务配置
export async function POST(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        const validationResult = await validateProjectId(projectId);
        if (!validationResult.success) {
            return validationResult.response;
        }
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
}
