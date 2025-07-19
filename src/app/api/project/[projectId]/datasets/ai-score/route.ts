import { NextResponse } from 'next/server';
import { getDatasetSampleById } from '@/server/db/dataset-samples';
import { getAIScoringPrompt } from '@/lib/ai/prompts/ai-score';
import { getModelConfigById } from '@/server/db/model-config';
import ModelClient from '@/lib/ai/core';
import { doubleCheckModelOutput } from '@/lib/utils';
import { aiScoreSchema } from '@/lib/ai/prompts/schema';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { EvalSourceType, ProjectRole } from 'src/server/db/types';
import { AuditLog } from '@/lib/middleware/audit-log';
import type { ApiContext } from '@/types/api-context';
import { createDatasetEval, getDatasetEvalList } from '@/server/db/dataset-evaluation';
import type { DatasetEvaluation } from '@prisma/client';

/**
 * AI 评分
 */
export const POST = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request) => {
    try {
        const { dssId, modelId } = await request.json();
        const dss = await getDatasetSampleById(dssId);
        if (!dss) {
            return NextResponse.json({ error: 'The dataset sample does not exist' }, { status: 404 });
        }
        const model = await getModelConfigById(modelId);
        if (!model) {
            return NextResponse.json({ error: 'The model does not exist' }, { status: 404 });
        }

        const prompt = getAIScoringPrompt(dss.questions.contextData, dss.question, dss.answer);
        const modelClient = new ModelClient(model);
        const { text } = await modelClient.chat(prompt);
        const modelOutput = await doubleCheckModelOutput(text, aiScoreSchema);
        console.log('modelOutput:', modelOutput);

        await createDatasetEval({
            sampleId: dss.id,
            sampleType: dss.questions.contextType,
            model: model.modelName,
            type: EvalSourceType.AI,
            factualAccuracyScore: modelOutput.scores.factualAccuracy,
            logicalIntegrityScore: modelOutput.scores.logicalIntegrity,
            expressionQualityScore: modelOutput.scores.expressionQuality,
            safetyComplianceScore: modelOutput.scores.safetyCompliance,
            compositeScore: modelOutput.scores.compositeScore,
            factualInfo: modelOutput.diagnostics.factualInfo ?? '',
            logicalInfo: modelOutput.diagnostics.logicalInfo ?? '',
            expressionInfo: modelOutput.diagnostics.expressionInfo ?? '',
            safetyInfo: modelOutput.diagnostics.safetyInfo ?? '',
            compositeInfo: modelOutput.diagnostics.compositeInfo ?? ''
        } as DatasetEvaluation);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('AI Score Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'AI Score Error' }, { status: 500 });
    }
});

export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const url = new URL(request.url);
        const searchParams = url.searchParams;
        const sampleId = searchParams.get('sampleId') ?? '';
        const sampleType = searchParams.get('sampleType') ?? '';

        if (sampleId === '' || sampleType === '') {
            return Response.json({
                code: 400,
                message: '参数错误'
            });
        }

        const list = await getDatasetEvalList(sampleId, sampleType);

        // 返回成功响应
        return NextResponse.json(list);
    } catch (error: unknown) {
        console.error('获取数据集失败:', error);

        // 根据错误类型返回适当的错误响应
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ error: '未知错误' }, { status: 500 });
    }
});
