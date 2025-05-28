import type { Prisma } from '@prisma/client';

export type QuestionsDTO = Prisma.QuestionsGetPayload<{
    include: {
        chunk: {
            select: {
                name: true;
                content: true;
            };
        };
        Datasets: true;
    };
}>;
