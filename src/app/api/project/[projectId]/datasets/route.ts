import { NextResponse } from 'next/server';
import { createDataset, getDatasetsByPagination, getDatasetsCount } from '@/lib/db/datasets';
import { getQuestionById, updateQuestion } from '@/lib/db/questions';
import { getChunkById } from '@/lib/db/chunks';
import { getProject } from '@/lib/db/projects';
import LLMClient from '@/lib/llm/core';
import { getAnswerPrompt } from '@/lib/llm/prompts/answer';
import { nanoid } from 'nanoid';
import type { Datasets, Questions } from '@prisma/client';
import { doubleCheckModelOutput } from '@/lib/utils';
import { answerSchema } from '@/lib/llm/prompts/schema';
import type { DatasetStrategyParams } from '@/types/dataset';
import { getModelConfigById } from '@/lib/db/model-config';
import type { AnswerStyle, DetailLevel, Language } from '@/lib/llm/prompts/type';

type Params = Promise<{ projectId: string }>;

/**
 * 生成数据集（为单个问题生成答案）
 */
export async function POST(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId } = params;
        const {
            questionId,
            datasetStrategyParams
        }: {
            questionId: string;
            datasetStrategyParams: DatasetStrategyParams;
        } = await request.json();
        // 验证参数
        if (!projectId || !questionId || !datasetStrategyParams.modelConfigId) {
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

        // 获取文本块内容
        const model = await getModelConfigById(datasetStrategyParams.modelConfigId);
        if (!model) {
            return NextResponse.json({ error: 'Model Config not found' }, { status: 404 });
        }

        // 获取项目配置
        const project = await getProject(projectId);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        const { globalPrompt, answerPrompt } = project;

        // 创建LLM客户端
        const llmClient = new LLMClient({
            ...model,
            temperature: datasetStrategyParams.temperature,
            maxTokens: datasetStrategyParams.maxTokens
        });

        const qTags = question.label?.split(',') ?? [];
        const cTags = chunk.ChunkMetadata?.tags?.split(',') ?? [];
        const allTags = [...new Set([...qTags, ...cTags])]; // 合并并去重

        const citation = datasetStrategyParams.citation;
        // 生成答案的提示词
        const prompt = getAnswerPrompt({
            context: chunk.content,
            question: question.question,
            detailLevel: datasetStrategyParams.detailLevel as DetailLevel,
            citation,
            answerStyle: datasetStrategyParams.answerStyle as AnswerStyle,
            tags: allTags,
            language: datasetStrategyParams.language as Language,
            globalPrompt,
            answerPrompt
        });

        // 调用大模型生成答案
        const { text, reasoning } = await llmClient.chat(prompt);
        const llmOutput = await doubleCheckModelOutput(text, answerSchema);
        const count = await getDatasetsCount(question.id);
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
            questionId: question.id,
            isPrimaryAnswer: count <= 0
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
        const input = searchParams.get('input') ?? '';
        const type = searchParams.get('type') ?? '';
        const status = searchParams.get('confirmed') ?? 'all';
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
}
