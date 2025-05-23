import { NextResponse } from 'next/server';
import { createDataset, getDatasetsByPagination } from '@/lib/db/datasets';
import { getQuestionById, updateQuestion } from '@/lib/db/questions';
import { getChunkById } from '@/lib/db/chunks';
import { getProject } from '@/lib/db/projects';
import LLMClient from '@/lib/llm/core';
import { getAnswerPrompt } from '@/lib/llm/prompts/answer';
import { nanoid } from 'nanoid';
import type { Datasets, Questions } from '@prisma/client';
import { doubleCheckModelOutput } from '@/lib/utils';
import { answerSchema } from '@/lib/llm/prompts/schema';

type Params = Promise<{ projectId: string }>;

/**
 * 生成数据集（为单个问题生成答案）
 */
export async function POST(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        const { questionId, model, language, datasetStrategyParams } = await request.json();
        // 验证参数
        if (!projectId || !questionId || !model) {
            return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
        }

        // 获取问题
        const question = await getQuestionById(questionId);
        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        // 获取文本块内容
        const chunk = await getChunkById(question.chunkId);
        if (!chunk) {
            return NextResponse.json({ error: 'Text block does not exist' }, { status: 404 });
        }

        // 获取项目配置
        const project = await getProject(projectId);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        const { globalPrompt, answerPrompt } = project;

        // 创建LLM客户端
        const llmClient = new LLMClient(model);

        const qTags = question.label?.split(',') ?? [];
        const cTags = chunk.ChunkMetadata?.tags?.split(',') ?? [];
        const allTags = [...new Set([...qTags, ...cTags])]; // 合并并去重

        const citation = Boolean(Number(datasetStrategyParams.citation));
        // 生成答案的提示词
        const prompt = getAnswerPrompt({
            context: chunk.content,
            question: question.question,
            detailLevel: datasetStrategyParams.detailLevel,
            citation,
            answerStyle: datasetStrategyParams.answerStyle,
            tags: allTags,
            language,
            globalPrompt,
            answerPrompt
        });

        // 调用大模型生成答案
        const { text, reasoning } = await llmClient.chat(prompt, 'textAndReasoning');
        const llmOutput = await doubleCheckModelOutput(text, answerSchema);
        console.log(llmOutput, 'llmOutput');
        const datasetId = nanoid(12);

        // 创建新的数据集项
        const datasets = {
            id: datasetId,
            projectId: projectId,
            question: question.question,
            answer: llmOutput.answer,
            model: model.modelName,
            cot: reasoning ?? '',
            referenceLabel: allTags.join(',') || '',
            evidence: citation ? JSON.stringify(llmOutput.evidence) : '',
            confidence: llmOutput.confidence,
            chunkName: chunk.name,
            chunkContent: chunk.content,
            questionId: question.id
        };
        let dataset = await createDataset(datasets as Datasets);
        await updateQuestion({ id: questionId, answered: true } as Questions);
        return NextResponse.json({ success: true, dataset });
    } catch (error) {
        console.error('Failed to generate dataset:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to generate dataset'
            },
            { status: 500 }
        );
    }
}

/**
 * 获取项目的所有数据集
 */
export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;

        // 验证项目ID是否有效
        if (!projectId) {
            return NextResponse.json({ error: '项目ID不能为空' }, { status: 400 });
        }

        // 解析查询参数
        const url = new URL(request.url);
        const searchParams = url.searchParams;
        const page = parseInt(searchParams.get('page') ?? '1');
        const size = parseInt(searchParams.get('size') ?? '10');
        const status = searchParams.get('status');
        const input = searchParams.get('input') ?? '';

        // 根据状态参数设置 confirmed 值
        const confirmed = status === 'confirmed' ? true : status === 'unconfirmed' ? false : undefined;

        // 调用数据获取函数
        const datasets = await getDatasetsByPagination(projectId, page, size, confirmed, input);

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
}
