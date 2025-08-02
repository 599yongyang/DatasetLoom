import { NextResponse } from 'next/server';
import ModelClient from '@/lib/ai/core/index';
import { getQuestionPrompt } from '@/lib/ai/prompts/question';
import { saveQuestions } from '@/server/db/questions';
import { getProject } from '@/server/db/projects';
import { getChunkById } from '@/server/db/chunks';
import { type Questions } from '@prisma/client';
import { questionsSchema } from '@/lib/ai/prompts/schema';
import { doubleCheckModelOutput } from '@/lib/utils';
import type { QuestionStrategyParams } from '@/types/question';
import { getModelConfigById } from '@/server/db/model-config';
import type { Language } from '@/lib/ai/prompts/type';
import type { ModelConfigWithProvider } from '@/lib/ai/core/types';
import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole, ContextType } from 'src/server/db/types';
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
        const { projectId } = context;

        // 获取请求体
        const {
            chunkId,
            questionStrategy
        }: {
            chunkId: string;
            questionStrategy: QuestionStrategyParams;
        } = await request.json();

        if (!chunkId || !questionStrategy.modelConfigId) {
            return NextResponse.json({ error: 'Chunk ID or model cannot be empty' }, { status: 400 });
        }

        // 并行获取文本块内容和项目配置
        const [chunk, project, model] = await Promise.all([
            getChunkById(chunkId),
            getProject(projectId),
            getModelConfigById(questionStrategy.modelConfigId)
        ]);

        if (!chunk || !project || !model) {
            return NextResponse.json({ error: 'not found' }, { status: 400 });
        }

        // 获取项目 提示词配置 信息
        const { globalPrompt, questionPrompt } = project;

        const modelClient = new ModelClient({
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
        const data = await modelClient.chat(prompt);
        console.log('Model Response:', data);
        const { text } = data;
        console.log('Model Output:', text);
        const modelOutput = await doubleCheckModelOutput(text, questionsSchema);
        console.log('Model Output after double check:', modelOutput);
        const questions = modelOutput.map(question => {
            return {
                realQuestion: question.question,
                question: question.question,
                label: question.label.join(','),
                projectId,
                contextId: chunk.id,
                contextData: chunk.content,
                contextName: chunk.name,
                contextType: ContextType.TEXT
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
// export const GET = compose(AuthGuard(ProjectRole.VIEWER))(async (request: Request, context: ApiContext) => {
//     try {
//         const {projectId, chunkId} = context;
//
//         // 验证项目ID和文本块ID
//         if (!projectId || !chunkId) {
//             return NextResponse.json({error: 'The item ID or text block ID cannot be empty'}, {status: 400});
//         }
//
//         // 获取文本块的问题
//         const questions = await getQuestionsForChunk(projectId, chunkId);
//
//         // 返回问题列表
//         return NextResponse.json({
//             chunkId,
//             questions,
//             total: questions.length
//         });
//     } catch (error) {
//         console.error('Error getting questions:', error);
//         return NextResponse.json(
//             {error: error instanceof Error ? error.message : 'Error getting questions'},
//             {status: 500}
//         );
//     }
// });
