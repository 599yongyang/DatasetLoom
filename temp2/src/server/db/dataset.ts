import { db } from '@/server/db/db';

/**
 * 获取数据集列表(根据项目ID)
 * @param projectId 项目id
 * @param page
 * @param pageSize
 * @param input
 * @param type
 * @param confirmed
 * @param contextType
 */
export async function getDatasetsByPagination(
    projectId: string,
    page = 1,
    pageSize = 10,
    input: string = '',
    type: string = '',
    confirmed: boolean | undefined,
    contextType: string
) {
    try {
        if (type === 'pp') {
            const whereClause: any = {
                projectId,
                prompt: { contains: input },
                question: {
                    ...(contextType !== 'all' && { contextType }),
                    ...(confirmed !== undefined && { confirmed })
                }
            };

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
                question: { contains: input },
                questions: {
                    ...(contextType !== 'all' && { contextType }),
                    ...(confirmed !== undefined && { confirmed })
                }
            };

            if (type === 'sft') {
                whereClause.isPrimaryAnswer = true;
            }

            const [data, total] = await Promise.all([
                db.datasetSamples.findMany({
                    where: whereClause,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip: (page - 1) * pageSize,
                    take: pageSize
                }),
                db.datasetSamples.count({ where: whereClause })
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

export async function getExportDatasetWithRawOrSFT({
    projectId,
    contextType,
    dataType,
    confirmedOnly,
    includeCOT
}: {
    projectId: string;
    contextType: string;
    dataType: string;
    confirmedOnly: boolean;
    includeCOT?: boolean;
}) {
    return db.datasetSamples.findMany({
        where: {
            projectId,
            questions: {
                confirmed: confirmedOnly ? true : undefined,
                contextType
            },
            ...(dataType === 'sft' ? { isPrimaryAnswer: true } : {})
        },
        select: {
            question: true,
            answer: true,
            cot: includeCOT,
            questions: {
                select: {
                    contextId: true,
                    realQuestion: true
                }
            }
        }
    });
}

export async function getExportDatasetWithDPO(projectId: string, contextType: string, confirmedOnly: boolean) {
    try {
        return await db.preferencePair.findMany({
            where: {
                projectId,
                question: {
                    confirmed: confirmedOnly ? true : undefined,
                    contextType
                }
            },
            select: {
                prompt: true,
                chosen: true,
                rejected: true,
                question: {
                    select: {
                        contextId: true,
                        realQuestion: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Failed to export datasets in database');
        throw error;
    }
}

export async function datasetKanbanData(projectId: string) {
    try {
        const [confirmedCount, allCount, sftCount, cotCount, dpoCount] = await Promise.all([
            db.datasetSamples.count({
                where: {
                    projectId,
                    questions: {
                        confirmed: true
                    }
                }
            }),
            db.datasetSamples.count({ where: { projectId } }),
            db.datasetSamples.count({
                where: {
                    projectId,
                    isPrimaryAnswer: true
                }
            }),
            db.datasetSamples.count({
                where: {
                    projectId,
                    cot: { not: '' }
                }
            }),
            db.preferencePair.count({ where: { projectId } })
        ]);

        return {
            confirmedCount,
            allCount,
            sftCount,
            cotCount,
            dpoCount
        };
    } catch (error) {
        console.error('Failed to fetch kanban data from database', error);
        throw error;
    }
}
