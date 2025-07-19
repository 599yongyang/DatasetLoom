import { NextResponse } from 'next/server';
import { createDatasetSample } from '@/server/db/dataset-samples';
import { getQuestionById, updateQuestion } from '@/server/db/questions';
import ModelClient from '@/lib/ai/core';
import type { DatasetSamples, Questions } from '@prisma/client';
import type { DatasetStrategyParams } from '@/types/dataset';
import { getModelConfigById } from '@/server/db/model-config';
import { getDatasetsByPagination } from '@/server/db/dataset';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ModelConfigType, ProjectRole, ContextType } from 'src/server/db/types';
import { AuditLog } from '@/lib/middleware/audit-log';
import type { ApiContext } from '@/types/api-context';
import { generateImageDatasetSample, generateTextDatasetSample } from '@/app/api/project/[projectId]/datasets/service';

/**
 * 生成数据集样本
 */
export const POST = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;

        const {
            questionId,
            datasetStrategyParams
        }: {
            questionId: string;
            datasetStrategyParams: DatasetStrategyParams;
        } = await request.json();

        if (!questionId || !datasetStrategyParams.modelConfigId) {
            return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
        }

        const question = await getQuestionById(questionId);
        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        const model = await getModelConfigById(datasetStrategyParams.modelConfigId);
        if (!model) {
            return NextResponse.json({ error: 'Model Config not found' }, { status: 404 });
        }

        const contextTypeSupported =
            (question.contextType === ContextType.TEXT && model.type.includes(ModelConfigType.TEXT)) ||
            (question.contextType === ContextType.IMAGE && model.type.includes(ModelConfigType.VISION));

        if (!contextTypeSupported) {
            return NextResponse.json({ error: 'Model does not support the question context type' }, { status: 400 });
        }

        const modelClient = new ModelClient({
            ...model,
            temperature: datasetStrategyParams.temperature,
            maxTokens: datasetStrategyParams.maxTokens
        });

        let datasetSamples: Partial<DatasetSamples>;

        if (question.contextType === ContextType.TEXT) {
            datasetSamples = await generateTextDatasetSample(
                question,
                datasetStrategyParams,
                modelClient,
                projectId,
                model.modelName
            );
        } else if (question.contextType === ContextType.IMAGE) {
            datasetSamples = await generateImageDatasetSample(
                question,
                datasetStrategyParams,
                modelClient,
                projectId,
                model.modelName
            );
        } else {
            return NextResponse.json({ error: 'Unsupported context type' }, { status: 400 });
        }

        const datasetSample = await createDatasetSample(datasetSamples as DatasetSamples);
        await updateQuestion({ id: questionId, answered: true } as Questions);

        return NextResponse.json({ success: true, datasetSample });
    } catch (error) {
        console.error('Failed to generate dataset:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to generate dataset'
            },
            { status: 500 }
        );
    }
});

/**
 * 获取项目的所有数据集
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId } = context;
        // 解析查询参数
        const url = new URL(request.url);
        const searchParams = url.searchParams;
        const page = parseInt(searchParams.get('page') ?? '1');
        const size = parseInt(searchParams.get('size') ?? '10');
        const input = searchParams.get('input') ?? '';
        const type = searchParams.get('type') ?? '';
        const status = searchParams.get('confirmed');
        let confirmed: boolean | undefined = undefined;
        if (status === 'confirmed') {
            confirmed = true;
        } else if (status === 'unconfirmed') {
            confirmed = false;
        }

        // 调用数据获取函数
        const datasets = await getDatasetsByPagination(projectId, page, size, input, type, confirmed);

        // 返回成功响应
        return NextResponse.json(datasets);
    } catch (error: unknown) {
        console.error('获取数据集失败:', error);

        // 根据错误类型返回适当的错误响应
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message || '获取数据集失败' }, { status: 500 });
        }

        return NextResponse.json({ error: '未知错误' }, { status: 500 });
    }
});
