import { compose } from '@/lib/middleware/compose';
import { AuthGuard } from '@/lib/middleware/auth-guard';
import { ProjectRole } from '@/server/db/types';
import { AuditLog } from '@/lib/middleware/audit-log';
import type { ApiContext } from '@/types/api-context';
import { NextResponse } from 'next/server';
import { getModelConfigById } from '@/server/db/model-config';
import LLMClient from '@/lib/ai/core';
import { getImageFileById } from '@/server/db/image-file';
import { readFileSync } from 'fs';
import { doubleCheckModelOutput } from '@/lib/utils';
import { z } from 'zod';
import { genImageQuestionPrompt } from '@/lib/ai/prompts/vision';

export const POST = compose(
    AuthGuard(ProjectRole.EDITOR),
    AuditLog()
)(async (request: Request, context: ApiContext) => {
    try {
        const { modelId, prompt, imageId } = await request.json();
        if (!modelId || !prompt) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }
        const modelConfig = await getModelConfigById(modelId);
        if (!modelConfig) {
            return NextResponse.json({ error: 'Model config not found' }, { status: 404 });
        }

        const llmClient = new LLMClient(modelConfig);
        const imageFile = await getImageFileById(imageId, true);
        if (!imageFile) throw new Error('Image file not found');

        const buffer: Buffer = readFileSync(imageFile.url);

        const { text } = await llmClient.vision(
            buffer,
            genImageQuestionPrompt(prompt, JSON.stringify(imageFile.ImageBlock))
        );
        const llmOutput = await doubleCheckModelOutput(text, z.array(z.string()));

        return NextResponse.json({ data: llmOutput });
    } catch (error) {
        console.error('Error save parserConfig:', error);
        return NextResponse.json({ error: 'Failed to save parserConfig' }, { status: 500 });
    }
});
