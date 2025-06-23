import { NextResponse } from 'next/server';
import LLMClient from '@/lib/llm/core/index';
import { getQuestionPrompt } from '@/lib/llm/prompts/question';
import { getQuestionsForChunk, saveQuestions } from '@/lib/db/questions';
import { getProject } from '@/lib/db/projects';
import { getChunkById } from '@/lib/db/chunks';
import { type Questions } from '@prisma/client';
import { questionsSchema } from '@/lib/llm/prompts/schema';
import { doubleCheckModelOutput } from '@/lib/utils';
import type { QuestionStrategyParams } from '@/types/question';
import { getModelConfigById } from '@/lib/db/model-config';
import type { Language } from '@/lib/llm/prompts/type';
import type { ModelConfigWithProvider } from '@/lib/llm/core/types';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/schema/types';
import { AuditLog } from '@/lib/middleware/audit-log';
import type { ApiContext } from '@/types/api-context';

/**
 * 生成指定文本块的问题
 */
export const POST = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { projectId, chunkId } = context;

        // 验证项目ID和文本块ID
        if (!projectId || !chunkId) {
            return NextResponse.json({ error: 'Project ID or text block ID cannot be empty' }, { status: 400 });
        }

        // 获取请求体
        const questionStrategy: QuestionStrategyParams = await request.json();
        console.log('questionStrategy:', questionStrategy, questionStrategy.modelConfigId);
        if (!questionStrategy.modelConfigId) {
            return NextResponse.json({ error: 'Model cannot be empty' }, { status: 400 });
        }

        // 并行获取文本块内容和项目配置
        const [chunk, project, model] = await Promise.all([
            getChunkById(chunkId),
            getProject(projectId),
            getModelConfigById(questionStrategy.modelConfigId)
        ]);

        if (!chunk || !project) {
            return NextResponse.json({ error: 'Text block does not exist' }, { status: 404 });
        }

        // 获取项目 提示词配置 信息
        const { globalPrompt, questionPrompt } = project;

        // 创建LLM客户端
        const llmClient = new LLMClient({
            ...model,
            temperature: questionStrategy.temperature,
            maxTokens: questionStrategy.maxTokens
        } as ModelConfigWithProvider);

        // 获取问题生成提示词
        const prompt = getQuestionPrompt({
            text: chunk.content,
            tags: chunk.tags || '',
            number:
                questionStrategy.questionCountType === 'custom' ? Number(questionStrategy.questionCount) : undefined,
            difficulty: questionStrategy.difficulty,
            audience: questionStrategy.audience,
            genre: questionStrategy.genre,
            language: questionStrategy.language as Language,
            globalPrompt,
            questionPrompt
        });
        const data = await llmClient.chat(prompt);
        console.log('LLM Response:', data);
        const { text } = data;
        console.log('LLM Output:', text);
        const llmOutput = await doubleCheckModelOutput(text, questionsSchema);
        console.log('LLM Output after double check:', llmOutput);
        const questions = llmOutput.map(question => {
            return {
                question: question.question,
                label: question.label.join(','),
                projectId,
                chunkId
            } as Questions;
        });
        // 保存问题到数据库
        await saveQuestions(questions as Questions[]);
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
});

/**
 * 获取指定文本块的问题
 */
export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
    try {
        const { projectId, chunkId } = context;

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
});
