'use server';

import { db } from '@/server/db';
import { type Questions } from '@prisma/client';

/**
 * 获取项目的所有问题
 * @param {string} projectId - 项目ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页大小
 * @param answered
 * @param input
 */
export async function getQuestions(
    projectId: string,
    page = 1,
    pageSize = 10,
    answered: boolean | undefined,
    input: string
) {
    try {
        const whereClause = {
            projectId,
            ...(answered !== undefined && { answered: answered }), // 确保 answered 是布尔值
            OR: [{ question: { contains: input } }, { label: { contains: input } }]
        };

        const [data, total] = await Promise.all([
            db.questions.findMany({
                where: whereClause,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    chunk: {
                        select: {
                            name: true,
                            content: true
                        }
                    },
                    Datasets: true
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            db.questions.count({
                where: whereClause
            })
        ]);

        // 批量查询 datasetCount
        const datasetCounts = await getDatasetCountsForQuestions(data.map(item => item.id));

        // 合并 datasetCount 到问题项中
        const questionsWithDatasetCount = data.map((item, index) => ({
            ...item,
            datasetCount: datasetCounts[index]
        }));

        return { data: questionsWithDatasetCount, total };
    } catch (error) {
        console.error('Failed to get questions by projectId in database');
        throw error;
    }
}

export async function getAllQuestionsByProjectId(projectId: string) {
    try {
        return await db.questions.findMany({
            where: { projectId },
            include: {
                chunk: {
                    select: {
                        name: true,
                        content: true
                    }
                }
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
        console.error('Failed to get datasets ids in database');
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
            },
            include: {
                chunk: {
                    select: {
                        content: true,
                        name: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Failed to get datasets ids in database');
        throw error;
    }
}

/**
 * 批量获取问题的 datasetCount
 * @param {Array<string>} questionIds - 问题ID列表
 * @returns {Promise<Array<number>>} - 每个问题的 datasetCount 列表
 */
async function getDatasetCountsForQuestions(questionIds: string[]) {
    const datasetCounts = await db.datasets.groupBy({
        by: ['questionId'],
        _count: {
            questionId: true
        },
        where: {
            questionId: {
                in: questionIds
            }
        }
    });

    // 将结果转换为 questionId 到 datasetCount 的映射
    const datasetCountMap: Record<string, number> = datasetCounts.reduce(
        (map, item) => {
            map[item.questionId] = item._count.questionId;
            return map;
        },
        {} as Record<string, number>
    );

    // 返回与 questionIds 顺序对应的 datasetCount 列表
    return questionIds.map(id => datasetCountMap[id] || 0);
}

export async function getQuestionById(id: string) {
    try {
        return await db.questions.findUnique({
            where: { id }
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

export async function getQuestionsCount(projectId: string) {
    try {
        return await db.questions.count({
            where: {
                projectId
            }
        });
    } catch (error) {
        console.error('Failed to get questions count in database');
        throw error;
    }
}

/**
 * 保存项目的问题列表
 * @param {string} projectId - 项目ID
 * @param {Array} questions - 问题列表
 * @param chunkId
 * @returns {Promise<Array>} - 保存后的问题列表
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

/**
 * 获取指定文本块的问题
 * @param {string} projectId - 项目ID
 * @param {string} chunkId - 文本块ID
 * @returns {Promise<Array>} - 问题列表
 */
export async function getQuestionsForChunk(projectId: string, chunkId: string) {
    return await db.questions.findMany({ where: { projectId, chunkId } });
}

/**
 * 删除单个问题
 * @param {string} questionId - 问题ID
 */
export async function deleteQuestion(questionId: string) {
    try {
        console.log(questionId);
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
