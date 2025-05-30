'use server';

import { db } from '@/server/db';
import type { DatasetSamples } from '@prisma/client';

/**
 * 获取数据集详情
 * @param id 数据集id
 */
export async function getDatasetSampleById(id: string) {
    try {
        return await db.datasetSamples.findUnique({
            where: { id }
        });
    } catch (error) {
        console.error('Failed to get datasets by id in database');
        throw error;
    }
}

/**
 * 保存数据集列表
 */
export async function createDatasetSample(data: DatasetSamples) {
    try {
        return await db.datasetSamples.create({
            data
        });
    } catch (error) {
        console.error('Failed to save datasets in database');
        throw error;
    }
}

/**
 * 更新数据集
 * @param data
 */
export async function updateDatasetSample(data: DatasetSamples) {
    try {
        return await db.datasetSamples.update({
            data,
            where: {
                id: data.id
            }
        });
    } catch (error) {
        console.error('Failed to update datasets in database');
        throw error;
    }
}

/**
 * 设置数据样本为主答案
 * @param id 数据集样本id
 * @param questionId 问题id
 */
export async function updateDatasetSamplePrimaryAnswer(id: string, questionId: string) {
    try {
        return await db.$transaction([
            db.datasetSamples.updateMany({
                where: { questionId },
                data: {
                    isPrimaryAnswer: false
                }
            }),
            db.datasetSamples.update({
                where: { id, questionId },
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

/**
 * 删除数据集样本
 * @param id 数据样本id
 */
export async function deleteDatasetSample(id: string) {
    try {
        return await db.datasetSamples.delete({
            where: { id }
        });
    } catch (error) {
        console.error('Failed to delete datasets in database');
        throw error;
    }
}
