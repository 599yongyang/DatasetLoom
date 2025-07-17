'use server';
import { db } from '@/server/db/db';
import type { ImageBlock } from '@prisma/client';

export async function createImageBlock(data: ImageBlock[]) {
    try {
        return await db.imageBlock.createMany({ data });
    } catch (error) {
        console.error('Failed to get imageFile by id in database');
        throw error;
    }
}

export async function getImageBlockPagination(projectId: string, page = 1, pageSize = 10, label: string) {
    try {
        const whereClause: any = {
            projectId
        };
        if (label) {
            whereClause.label = { contains: label };
        }
        const [data, total] = await Promise.all([
            db.imageBlock.findMany({
                where: whereClause,
                include: {
                    image: true
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            db.imageBlock.count({
                where: whereClause
            })
        ]);
        return { data, total };
    } catch (error) {
        console.error('Failed to get imageBlock by pagination in database');
        throw error;
    }
}

// 获取标注的坐标信息
export async function getBlockCoordinates(blockId: string) {
    return db.imageBlock.findUnique({
        where: { id: blockId },
        select: { x: true, y: true, width: true, height: true, label: true }
    });
}
