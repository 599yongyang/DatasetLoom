import type { Prisma } from '@prisma/client';

export type ModelConfigWithProvider = Prisma.ModelConfigGetPayload<{
    include: { provider: true };
}>;


export type QuestionsWithDatasetSample = Prisma.QuestionsGetPayload<{
    include: {
        DatasetSamples: true;
    };
}>;

export type DatasetSampleWithQuestion = Prisma.DatasetSamplesGetPayload<{
    include: {
        questions: { select: { contextType: true, contextData: true, realQuestion: true, contextId: true } },
    },
}>;


