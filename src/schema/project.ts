import type { Prisma } from '@prisma/client';

export type ProjectsWithCounts = Prisma.ProjectsGetPayload<{
    include: {
        _count: {
            select: {
                Datasets: true;
                Questions: true;
            };
        };
    };
}>;
