import type { Datasets } from '@prisma/client';

export type DatasetsPage = {
    confirmedCount: number;
    data: Datasets[];
    total: number;
};
