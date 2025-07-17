import type { Prisma } from '@prisma/client';

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
