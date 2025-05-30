'use server';

import { db } from '@/server/db';
import type { Datasets } from '@prisma/client';

/**
 * 获取数据集列表(根据项目ID)
 * @param projectId 项目id
 * @param page
 * @param pageSize
 * @param input
 * @param type
 * @param confirmed
 */
export async function getDatasetsByPagination(
    projectId: string,
    page = 1,
    pageSize = 10,
    input: string = '',
    type: string = '',
    confirmed: boolean | undefined
) {
    try {
        if (type === 'pp') {
            const whereClause: any = {
                projectId,
                prompt: { contains: input },
                question: {
                    confirmed: confirmed
                }
            };

            if (confirmed) {
                whereClause.questions = { confirmed };
            }
            const [data, total] = await Promise.all([
                db.preferencePair.findMany({
                    where: whereClause,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip: (page - 1) * pageSize,
                    take: pageSize
                }),
                db.preferencePair.count({
                    where: whereClause
                })
            ]);

            return {
                data,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / pageSize),
                pageSize
            };
        } else {
            let whereClause: any = {
                projectId,
                question: { contains: input }
            };
            if (confirmed) {
                whereClause.questions = { confirmed };
            }

            if (type === 'sft') {
                whereClause.isPrimaryAnswer = true;
            }

            const [data, total] = await Promise.all([
                db.datasets.findMany({
                    where: whereClause,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip: (page - 1) * pageSize,
                    take: pageSize
                }),
                db.datasets.count({ where: whereClause })
            ]);

            return {
                data,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / pageSize),
                pageSize
            };
        }
    } catch (error) {
        console.error('Failed to get data by pagination', error);
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
                createdAt: 'desc'
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
                createdAt: 'desc'
            }
        });
    } catch (error) {
        console.error('Failed to get datasets ids in database');
        throw error;
    }
}

/**
 * 获取数据集数量
 * @param questionId 问题id
 */
export async function getDatasetsCount(questionId: string) {
    try {
        return await db.datasets.count({
            where: {
                questionId
            }
        });
    } catch (error) {
        console.error('Failed to get datasets count by questionId in database');
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

export async function updateDatasetPrimaryAnswer(datasetId: string, questionId: string) {
    console.log('updateDatasetPrimaryAnswer', datasetId, questionId);
    try {
        return await db.$transaction([
            db.datasets.updateMany({
                where: { questionId },
                data: {
                    isPrimaryAnswer: false
                }
            }),
            db.datasets.update({
                where: {
                    id: datasetId,
                    questionId
                },
                data: {
                    isPrimaryAnswer: true
                }
            })
        ]);
    } catch (error) {
        console.error('Failed to update primary answer in database');
        throw new Error('Failed to set primary answer');
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

export async function exportDatasetRaw(projectId: string, confirmedOnly: boolean, cot: boolean = true) {
    try {
        const questions = await db.questions.findMany({
            where: {
                projectId,
                confirmed: confirmedOnly ? true : undefined,
                Datasets: {
                    some: {}
                }
            },
            select: {
                question: true,
                Datasets: {
                    select: {
                        answer: true,
                        cot,
                        model: true
                    }
                }
            }
        });
        const result = questions.map(q => ({
            question: q.question,
            answers: q.Datasets.map(d => ({
                text: d.answer,
                model: d.model,
                ...(cot ? { cot: d.cot ?? '' } : {})
            }))
        }));

        return result;
    } catch (error) {
        console.error('Failed to export datasets in database');
        throw error;
    }
}

export async function exportDatasetSFT(projectId: string, confirmedOnly: boolean, cot: boolean = true) {
    try {
        const questions = await db.questions.findMany({
            where: {
                projectId,
                confirmed: confirmedOnly ? true : undefined,
                Datasets: {
                    some: {
                        isPrimaryAnswer: true
                    }
                }
            },
            select: {
                question: true,
                Datasets: {
                    select: {
                        answer: true,
                        cot,
                        confidence: true,
                        model: true
                    }
                }
            }
        });
        const result = questions.map(q => ({
            instruction: q.question,
            output: q.Datasets[0]?.answer ?? '',
            confidence: q.Datasets[0]?.confidence ?? 0,
            ...(cot ? { cot: q.Datasets[0]?.cot ?? '' } : {})
        }));

        return result;
    } catch (error) {
        console.error('Failed to export datasets in database');
        throw error;
    }
}

export async function exportDatasetDPO(projectId: string, confirmedOnly: boolean) {
    try {
        const questions = await db.questions.findMany({
            where: {
                projectId,
                confirmed: confirmedOnly ? true : undefined,
                PreferencePair: {
                    isNot: null
                }
            },
            select: {
                question: true,
                PreferencePair: {
                    select: {
                        chosen: true,
                        rejected: true
                    }
                }
            }
        });
        const result = questions.map(question => {
            const pair = question.PreferencePair;
            return {
                prompt: question.question,
                chosen: pair?.chosen ?? '',
                rejected: pair?.rejected ?? ''
            };
        });

        return result;
    } catch (error) {
        console.error('Failed to export datasets in database');
        throw error;
    }
}
