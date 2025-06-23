import type { Prisma } from '@prisma/client';

export type DocumentsWithCount = Prisma.DocumentsGetPayload<{
    include: {
        _count: {
            select: {
                Chunks: true;
            };
        };
    };
}>;
