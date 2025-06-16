import { NextResponse } from 'next/server';
import { getDatasetSampleById, updateDatasetSample } from '@/lib/db/dataset-samples';
import { getAIScoringPrompt } from '@/lib/llm/prompts/ai-score';
import { getModelConfigById } from '@/lib/db/model-config';
import LLMClient from '@/lib/llm/core';
import { doubleCheckModelOutput } from '@/lib/utils';
import { aiScoreSchema } from '@/lib/llm/prompts/schema';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import { AuditLog } from '@/lib/middleware/audit-log';

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

        const prompt = getAIScoringPrompt(dss.chunkContent, dss.question, dss.answer);
        // 创建LLM客户端
        const llmClient = new LLMClient(model);
        const { text } = await llmClient.chat(prompt);
        const llmOutput = await doubleCheckModelOutput(text, aiScoreSchema);
        console.log('llmOutput:', llmOutput);
        await updateDatasetSample({
            ...dss,
            aiScoreModel: model.modelName,
            factualAccuracyScore: llmOutput.scores.factualAccuracy,
            logicalIntegrityScore: llmOutput.scores.logicalIntegrity,
            expressionQualityScore: llmOutput.scores.expressionQuality,
            safetyComplianceScore: llmOutput.scores.safetyCompliance,
            compositeScore: llmOutput.scores.compositeScore,
            factualInfo: llmOutput.diagnostics.factualInfo ?? '',
            logicalInfo: llmOutput.diagnostics.logicalInfo ?? '',
            expressionInfo: llmOutput.diagnostics.expressionInfo ?? '',
            safetyInfo: llmOutput.diagnostics.safetyInfo ?? '',
            compositeInfo: llmOutput.diagnostics.compositeInfo ?? ''
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('AI Score Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'AI Score Error' }, { status: 500 });
    }
});
