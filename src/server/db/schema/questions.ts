import type { Prisma } from '@prisma/client';

export type QuestionsDTO = Prisma.QuestionsGetPayload<{
    include: {
        DatasetSamples: true;
    };
}>;
