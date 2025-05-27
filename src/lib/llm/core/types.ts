import type { Prisma } from '@prisma/client';

export type ModelConfigWithProvider = Prisma.ModelConfigGetPayload<{
    include: { provider: true };
}>;

// 选项类型
export interface ConfigOptions {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
}
