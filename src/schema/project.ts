import type { Prisma } from '@prisma/client';

export type ProjectsWithCounts = Prisma.ProjectsGetPayload<{
    include: {
        _count: {
            select: {
                DatasetSamples: true;
                Questions: true;
                ModelConfig: true;
            };
        };
    };
}>;
