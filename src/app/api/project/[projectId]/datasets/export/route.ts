import { NextResponse } from 'next/server';
import { getDatasets } from '@/lib/db/datasets';

type Params = Promise<{ projectId: string }>;

/**
 * 获取导出数据集
 */
export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        const { searchParams } = new URL(request.url);
        // 验证项目ID
        if (!projectId) {
            return NextResponse.json({ error: '项目ID不能为空' }, { status: 400 });
        }
        let status = searchParams.get('status');
        let confirmed = undefined;
        if (status === 'confirmed') confirmed = true;
        if (status === 'unconfirmed') confirmed = false;
        // 获取数据集
        let datasets = await getDatasets(projectId, confirmed);
        return NextResponse.json(datasets);
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
