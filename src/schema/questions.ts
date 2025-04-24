import type { Prisma } from '@prisma/client';

export type QuestionsDTO = Prisma.QuestionsGetPayload<{
    include: {
        chunk: {
            select: {
                name: true;
                content: true;
            };
        };
    };
}> & {
    datasetCount: number;
};

// 定义返回类型
export interface QuestionsVO {
    data: Array<QuestionsDTO>;
    total: number;
}
