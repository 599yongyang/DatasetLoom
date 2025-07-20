'use server';

import { db } from '@/server/db/db';
import { type Questions } from '@prisma/client';

/**
 * 获取项目的所有问题
 * @param {string} projectId - 项目ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页大小
 * @param answered
 * @param input
 * @param contextType
 */
export async function getQuestions(
    projectId: string,
    page: number = 1,
    pageSize: number = 10,
    answered: boolean | undefined,
    input: string,
    contextType: string
) {
    try {
        const whereClause = {
            projectId,
            ...(answered !== undefined && { answered: answered }), // 确保 answered 是布尔值
            OR: [{ question: { contains: input } }, { label: { contains: input } }],
            ...(contextType !== 'all' && { contextType: contextType })
        };

        const [data, total] = await Promise.all([
            db.questions.findMany({
                where: whereClause,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    DatasetSamples: true
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            db.questions.count({
                where: whereClause
            })
        ]);

        return { data, total };
    } catch (error) {
        console.error('Failed to get questions by projectId in database');
        throw error;
    }
}

export async function getAllQuestionsByProjectId(projectId: string) {
    try {
        return await db.questions.findMany({
            where: { projectId },
            orderBy: {
                createdAt: 'desc'
            }
        });
    } catch (error) {
        console.error('Failed to get questions ids in database');
        throw error;
    }
}

export async function getQuestionsIds(projectId: string, answered: boolean | undefined, input: string) {
    try {
        const whereClause = {
            projectId,
            ...(answered !== undefined && { answered: answered }), // 确保 answered 是布尔值
            OR: [{ question: { contains: input } }, { label: { contains: input } }]
        };
        return await db.questions.findMany({
            where: whereClause,
            select: {
                id: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    } catch (error) {
        console.error('Failed to get questions ids in database');
        throw error;
    }
}

export async function getQuestionsByIds(projectId: string, ids: string[]) {
    try {
        return await db.questions.findMany({
            where: {
                projectId,
                id: {
                    in: ids
                }
            }
        });
    } catch (error) {
        console.error('Failed to get questions ids in database');
        throw error;
    }
}

export async function getQuestionById(id: string) {
    try {
        return await db.questions.findUnique({
            where: { id },
            include: {
                DatasetSamples: true
            }
        });
    } catch (error) {
        console.error('Failed to get questions by name in database');
        throw error;
    }
}

export async function isExistByQuestion(question: string) {
    try {
        const count = await db.questions.count({
            where: { question }
        });
        return count > 0;
    } catch (error) {
        console.error('Failed to get questions by name in database');
        throw error;
    }
}

export async function getQuestionWithDatasetById(id: string) {
    try {
        return await db.questions.findUnique({
            where: { id },
            include: {
                DatasetSamples: true,
                PreferencePair: true
            }
        });
    } catch (error) {
        console.error('Failed to get questions by name in database');
        throw error;
    }
}

export async function getNavigationItems(projectId: string, questionId: string, operateType: 'prev' | 'next') {
    const currentItem = await db.questions.findUnique({
        where: { id: questionId },
        select: { id: true, createdAt: true }
    });

    if (!currentItem) {
        throw new Error('当前记录不存在');
    }

    const { createdAt, id } = currentItem;

    if (operateType === 'next') {
        return db.questions.findFirst({
            where: {
                projectId,
                DatasetSamples: { some: {} },
                OR: [{ createdAt: { gt: createdAt } }, { createdAt: createdAt, id: { gt: id } }]
            },
            include: { DatasetSamples: true, PreferencePair: true },
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
        });
    } else {
        return db.questions.findFirst({
            where: {
                projectId,
                DatasetSamples: { some: {} },
                OR: [{ createdAt: { lt: createdAt } }, { createdAt: createdAt, id: { lt: id } }]
            },
            include: { DatasetSamples: true, PreferencePair: true },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
        });
    }
}

/**
 * 保存项目的问题列表
 * @param {Array} questions - 问题列表
 */
export async function saveQuestions(questions: Questions[]) {
    try {
        return await db.questions.createMany({ data: questions });
    } catch (error) {
        console.error('Failed to create questions in database');
        throw error;
    }
}

export async function updateQuestion(question: Questions) {
    try {
        return await db.questions.update({ where: { id: question.id }, data: question });
    } catch (error) {
        console.error('Failed to update questions in database');
        throw error;
    }
}

export async function getQuestionsCount(projectId: string) {
    try {
        // 获取总数：有 DatasetSamples 的问题
        const total = await db.questions.count({
            where: {
                projectId,
                DatasetSamples: { some: {} }
            }
        });

        // 获取已确认的数量
        const confirmedCount = await db.questions.count({
            where: {
                projectId,
                confirmed: true,
                DatasetSamples: { some: {} }
            }
        });

        return { total, confirmedCount };
    } catch (error) {
        console.error('Failed to get questions count in database', error);
        throw error;
    }
}

/**
 * 获取指定文本块的问题
 * @param {string} projectId - 项目ID
 * @param {string} chunkId - 文本块ID
 */
export async function getQuestionsForChunk(projectId: string, chunkId: string) {
    // try {
    //     return await db.questions.findMany({ where: { projectId, chunkId } });
    // } catch (error) {
    //     console.error('Failed to get questions in database');
    //     throw error;
    // }
}

/**
 * 删除单个问题
 * @param {string} questionId - 问题ID
 */
export async function deleteQuestion(questionId: string) {
    try {
        return await db.questions.delete({
            where: {
                id: questionId
            }
        });
    } catch (error) {
        console.error('Failed to delete questions by id in database');
        throw error;
    }
}

/**
 * 批量删除问题
 * @param {Array} questionIds
 */
export async function batchDeleteQuestions(questionIds: string[]) {
    try {
        return await db.questions.deleteMany({
            where: {
                id: {
                    in: questionIds
                }
            }
        });
    } catch (error) {
        console.error('Failed to delete batch questions in database');
        throw error;
    }
}
