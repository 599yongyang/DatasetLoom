import type ModelClient from '@/lib/ai/core';
import { aiScoreSchema } from '@/lib/ai/prompts/schema';
import { doubleCheckModelOutput } from '@/lib/utils';

export async function modelEvaluation(modelClient: ModelClient, prompt: string, buffer?: Buffer) {
    const { text } = buffer ? await modelClient.vision(buffer, prompt) : await modelClient.chat(prompt);

    return doubleCheckModelOutput(text, aiScoreSchema);
}
