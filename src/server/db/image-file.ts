'use server';
import { db } from '@/server/db/db';
import type { ImageFile } from '@prisma/client';
import type { ImageWithImageBlock } from '@/server/db/schema/image-block';

//获取图片列表
export async function getImagePagination(projectId: string, page = 1, pageSize = 10, fileName: string, block: boolean) {
    try {
        const whereClause: any = {
            projectId
        };
        if (fileName) {
            whereClause.fileName = { contains: fileName };
        }
        // if (Boolean(block)) {
        //     whereClause.ImageBlock = {
        //         some: {}
        //     };
        // }
        const [data, total] = await Promise.all([
            db.imageFile.findMany({
                where: whereClause,
                include: {
                    ImageBlock: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            db.imageFile.count({
                where: whereClause
            })
        ]);
        return { data, total };
    } catch (error) {
        console.error('Failed to get imageFile by pagination in database');
        throw error;
    }
}

export async function getImageFileById(id: string, include: boolean = false): Promise<ImageWithImageBlock | null> {
    try {
        return await db.imageFile.findUnique({
            where: { id },
            include: {
                ImageBlock: include
            }
        });
    } catch (error) {
        console.error('Error fetching ImageFile by ID:', error);
        throw error;
    }
}

export async function createImageFile(data: ImageFile) {
    try {
        return await db.imageFile.create({ data });
    } catch (error) {
        console.error('Failed to get imageFile by id in database');
        throw error;
    }
}

export async function updateImageFile(id: string, data: ImageFile) {
    try {
        return await db.imageFile.update({ where: { id }, data });
    } catch (error) {
        console.error('Failed to update imageFile by id in database');
        throw error;
    }
}

export async function delImageByIds(fileId: string[]) {
    try {
        return await db.imageFile.deleteMany({ where: { id: { in: fileId } } });
    } catch (error) {
        console.error('Failed to delete imageFile by id in database');
        throw error;
    }
}

export async function getImageFileUrl(contextId: string) {
    return db.imageFile.findUnique({
        where: { id: contextId },
        select: { url: true }
    });
}
