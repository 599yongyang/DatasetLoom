import { NextResponse } from 'next/server';
import LLMClient from '@/lib/llm/core/index';
import { getQuestionPrompt } from '@/lib/llm/prompts/question';
import { getQuestionEnPrompt } from '@/lib/llm/prompts/questionEn';
import { getQuestionsForChunk, saveQuestions } from '@/lib/db/questions';
import { extractJsonFromLLMOutput } from '@/lib/llm/common/util';
import { getTaskConfig, getProject } from '@/lib/db/projects';
import { getChunkById } from '@/lib/db/chunks';
import { type Questions } from '@prisma/client';
import { questionsSchema } from '@/lib/llm/prompts/schema';

type Params = Promise<{ projectId: string; chunkId: string }>;

// 为指定文本块生成问题
export async function POST(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId, chunkId } = params;

        // 验证项目ID和文本块ID
        if (!projectId || !chunkId) {
            return NextResponse.json({ error: 'Project ID or text block ID cannot be empty' }, { status: 400 });
        }

        // 获取请求体
        const { model, language, number } = await request.json();

        if (!model) {
            return NextResponse.json({ error: 'Model cannot be empty' }, { status: 400 });
        }

        // 并行获取文本块内容和项目配置
        const [chunk, taskConfig, project] = await Promise.all([
            getChunkById(chunkId),
            getTaskConfig(projectId),
            getProject(projectId)
        ]);

        if (!chunk || !project) {
            return NextResponse.json({ error: 'Text block does not exist' }, { status: 404 });
        }

        // 获取项目 task-config 信息
        const { globalPrompt, questionPrompt } = project;
        // 创建LLM客户端
        const llmClient = new LLMClient(model);
        // 根据语言选择相应的提示词函数
        const promptFunc = language === 'en' ? getQuestionEnPrompt : getQuestionPrompt;
        const prompt = promptFunc({
            text: chunk.content,
            tags: chunk.ChunkMetadata?.tags || '',
            globalPrompt,
            questionPrompt
        });
        const response = await llmClient.getResponse(prompt, {}, questionsSchema);

        // 从LLM输出中提取JSON格式的问题列表
        let questions = extractJsonFromLLMOutput(response);

        if (!questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
        }
        questions = questions.map(question => {
            return {
                question: question.question,
                label: question.label.join(','),
                projectId,
                chunkId
            };
        });
        // 保存问题到数据库
        await saveQuestions(questions);
        // 返回生成的问题
        return NextResponse.json({
            chunkId,
            questions,
            total: questions.length
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error generating questions' },
            { status: 500 }
        );
    }
}

// 获取指定文本块的问题
export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const { projectId, chunkId } = params;

        // 验证项目ID和文本块ID
        if (!projectId || !chunkId) {
            return NextResponse.json({ error: 'The item ID or text block ID cannot be empty' }, { status: 400 });
        }

        // 获取文本块的问题
        const questions = await getQuestionsForChunk(projectId, chunkId);

        // 返回问题列表
        return NextResponse.json({
            chunkId,
            questions,
            total: questions.length
        });
    } catch (error) {
        console.error('Error getting questions:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error getting questions' },
            { status: 500 }
        );
    }
}
