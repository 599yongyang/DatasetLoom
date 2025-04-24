'use server';

import { db } from '@/server/db';
import type { Datasets } from '@prisma/client';

/**
 * 获取数据集列表(根据项目ID)
 * @param projectId 项目id
 * @param page
 * @param pageSize
 * @param confirmed
 * @param input
 */
export async function getDatasetsByPagination(
    projectId: string,
    page = 1,
    pageSize = 10,
    confirmed: boolean | undefined,
    input: string
) {
    try {
        const whereClause = {
            projectId,
            ...(confirmed !== undefined && { confirmed: confirmed }),
            question: { contains: input }
        };
        const [data, total, confirmedCount] = await Promise.all([
            db.datasets.findMany({
                where: whereClause,
                orderBy: {
                    createAt: 'desc'
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            db.datasets.count({
                where: whereClause
            }),
            db.datasets.count({
                where: { ...whereClause, confirmed: true }
            })
        ]);

        return { data, total, confirmedCount };
    } catch (error) {
        console.error('Failed to get datasets by pagination in database');
        throw error;
    }
}

export async function getDatasets(projectId: string, confirmed: boolean | undefined) {
    try {
        const whereClause = {
            projectId,
            ...(confirmed !== undefined && { confirmed: confirmed })
        };
        return await db.datasets.findMany({
            where: whereClause,
            select: {
                question: true,
                answer: true,
                cot: true
            },
            orderBy: {
                createAt: 'desc'
            }
        });
    } catch (error) {
        console.error('Failed to get datasets in database');
        throw error;
    }
}

export async function getDatasetsIds(projectId: string, confirmed: boolean | undefined, input: string) {
    try {
        const whereClause = {
            projectId,
            ...(confirmed !== undefined && { confirmed: confirmed }),
            question: { contains: input }
        };
        return await db.datasets.findMany({
            where: whereClause,
            select: {
                id: true
            },
            orderBy: {
                createAt: 'desc'
            }
        });
    } catch (error) {
        console.error('Failed to get datasets ids in database');
        throw error;
    }
}

/**
 * 获取数据集数量(根据项目ID)
 * @param projectId 项目id
 */
export async function getDatasetsCount(projectId: string) {
    try {
        return await db.datasets.count({
            where: {
                projectId
            }
        });
    } catch (error) {
        console.error('Failed to get datasets count by projectId in database');
        throw error;
    }
}

/**
 * 获取数据集数量(根据问题Id)
 * @param questionId 问题Id
 */
export async function getDatasetsCountByQuestionId(questionId: string) {
    try {
        return await db.datasets.count({
            where: {
                questionId
            }
        });
    } catch (error) {
        console.error('Failed to get datasets count by projectId in database');
        throw error;
    }
}

/**
 * 获取数据集详情
 * @param id 数据集id
 */
export async function getDatasetsById(id: string) {
    try {
        return await db.datasets.findUnique({
            where: { id }
        });
    } catch (error) {
        console.error('Failed to get datasets by id in database');
        throw error;
    }
}

/**
 * 保存数据集列表
 * @param dataset
 */
export async function createDataset(dataset: Datasets) {
    try {
        return await db.datasets.create({
            data: dataset
        });
    } catch (error) {
        console.error('Failed to save datasets in database');
        throw error;
    }
}

export async function updateDataset(dataset: Datasets) {
    try {
        return await db.datasets.update({
            data: dataset,
            where: {
                id: dataset.id
            }
        });
    } catch (error) {
        console.error('Failed to update datasets in database');
        throw error;
    }
}

export async function deleteDataset(datasetId: string) {
    try {
        return await db.datasets.delete({
            where: {
                id: datasetId
            }
        });
    } catch (error) {
        console.error('Failed to delete datasets in database');
        throw error;
    }
}

export async function getDatasetsCounts(projectId: string) {
    try {
        const [total, confirmedCount] = await Promise.all([
            db.datasets.count({
                where: { projectId }
            }),
            db.datasets.count({
                where: { projectId, confirmed: true }
            })
        ]);

        return { total, confirmedCount };
    } catch (error) {
        console.error('Failed to delete datasets in database');
        throw error;
    }
}

export async function getNavigationItems(projectId: string, datasetId: string, operateType: 'prev' | 'next') {
    const currentItem = await db.datasets.findUnique({
        where: { id: datasetId }
    });
    if (!currentItem) {
        throw new Error('当前记录不存在');
    }
    if (operateType === 'prev') {
        return await db.datasets.findFirst({
            where: { createAt: { gt: currentItem.createAt }, projectId },
            orderBy: { createAt: 'asc' }
        });
    } else {
        return await db.datasets.findFirst({
            where: { createAt: { lt: currentItem.createAt }, projectId },
            orderBy: { createAt: 'desc' }
        });
    }
}
