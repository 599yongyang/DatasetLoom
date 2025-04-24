import type { Prisma } from '@prisma/client';

export type ChunksVO = Prisma.ChunksGetPayload<{
    include: {
        Questions: {
            select: {
                id: true;
                question: true;
            };
        };
    };
}>;
