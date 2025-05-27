import { NextResponse } from 'next/server';
import LLMClient from '@/lib/llm/core/index';
import { getModelConfigById } from '@/lib/db/model-config';

/**
 * 流式输出的聊天接口
 */
type Params = Promise<{ projectId: string }>;

export async function POST(request: Request, props: { params: Params }) {
    const params = await props.params;
    const { projectId } = params;

    try {
        const body = await request.json();
        const { model, messages } = body;

        if (!model || !messages) {
            return NextResponse.json({ error: 'Missing necessary parameters' }, { status: 400 });
        }
        let modelConfig = await getModelConfigById(model.id);
        if (!modelConfig) {
            return NextResponse.json({ error: 'Model config not found' }, { status: 400 });
        }
        // 创建 LLM 客户端
        const llmClient = new LLMClient(modelConfig);
        try {
            // 调用流式 API
            const stream = await llmClient.chatStream(messages);
            // 返回流式响应
            return stream;
        } catch (error) {
            console.error('Failed to call LLM API:', error);
            return NextResponse.json(
                {
                    error: `Failed to call ${model.provider} model: ${error instanceof Error ? error.message : error}`
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Failed to process stream chat request:', error);
        return NextResponse.json(
            { error: `Failed to process stream chat request: ${error instanceof Error ? error.message : error}` },
            { status: 500 }
        );
    }
}
