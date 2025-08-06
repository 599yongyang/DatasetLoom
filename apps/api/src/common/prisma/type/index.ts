import type {Prisma} from '@prisma/client';

export type ModelConfigWithProvider = Prisma.ModelConfigGetPayload<{
    include: { provider: true };
}>;

export type DocumentsWithCount = Prisma.DocumentsGetPayload<{
    include: {
        _count: {
            select: {
                Chunks: true;
            };
        };
    };
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

export type ImageBlockWithImage = Prisma.ImageBlockGetPayload<{
    include: {
        image: true;
    };
}>;
export type ImageWithImageBlock = Prisma.ImageFileGetPayload<{
    include: {
        ImageBlock: true;
    };
}>;
