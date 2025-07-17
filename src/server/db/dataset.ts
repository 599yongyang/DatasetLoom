import { db } from '@/server/db/db';

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
                prompt: { contains: input }
            };

            if (confirmed !== undefined) {
                whereClause.question = { confirmed };
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
            if (confirmed !== undefined) {
                whereClause.questions = { confirmed };
            }

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

export async function exportDatasetRaw(projectId: string, confirmedOnly: boolean, cot: boolean = true) {
    try {
        const questions = await db.questions.findMany({
            where: {
                projectId,
                confirmed: confirmedOnly ? true : undefined,
                DatasetSamples: {
                    some: {}
                }
            },
            select: {
                question: true,
                DatasetSamples: {
                    select: {
                        answer: true,
                        cot,
                        model: true
                    }
                }
            }
        });
        return questions.map(q => ({
            question: q.question,
            answers: q.DatasetSamples.map(d => ({
                text: d.answer,
                model: d.model,
                ...(cot ? { cot: d.cot ?? '' } : {})
            }))
        }));
    } catch (error) {
        console.error('Failed to export datasets Raw in database');
        throw error;
    }
}

export async function exportDatasetSFT(projectId: string, confirmedOnly: boolean, cot: boolean = true) {
    try {
        const questions = await db.questions.findMany({
            where: {
                projectId,
                confirmed: confirmedOnly ? true : undefined,
                DatasetSamples: {
                    some: {
                        isPrimaryAnswer: true
                    }
                }
            },
            select: {
                question: true,
                DatasetSamples: {
                    select: {
                        answer: true,
                        cot,
                        confidence: true,
                        model: true
                    }
                }
            }
        });
        return questions.map(q => ({
            instruction: q.question,
            output: q.DatasetSamples[0]?.answer ?? '',
            confidence: q.DatasetSamples[0]?.confidence ?? 0,
            ...(cot ? { cot: q.DatasetSamples[0]?.cot ?? '' } : {})
        }));
    } catch (error) {
        console.error('Failed to export datasets SFT in database');
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
        return questions.map(question => {
            const pair = question.PreferencePair;
            return {
                prompt: question.question,
                chosen: pair?.chosen ?? '',
                rejected: pair?.rejected ?? ''
            };
        });
    } catch (error) {
        console.error('Failed to export datasets DPO in database');
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
