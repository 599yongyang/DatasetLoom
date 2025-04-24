'use server';
import { nanoid } from 'nanoid';
import { db } from '@/server/db';
import type { ModelConfig } from '@prisma/client';

export async function getModelConfigByProjectId(projectId: string) {
    try {
        return await db.modelConfig.findMany({ where: { projectId }, orderBy: { createAt: 'desc' } });
    } catch (error) {
        console.error('Failed to get modelConfig by projectId in database');
        throw error;
    }
}

export async function createInitModelConfig(data: ModelConfig[]) {
    try {
        return await db.modelConfig.createManyAndReturn({ data, omit: { id: true } });
    } catch (error) {
        console.error('Failed to create init modelConfig list in database');
        throw error;
    }
}

export async function getModelConfigById(id: string) {
    try {
        return await db.modelConfig.findUnique({ where: { id } });
    } catch (error) {
        console.error('Failed to get modelConfig by id in database');
        throw error;
    }
}

export async function deleteModelConfigById(id: string) {
    try {
        return await db.modelConfig.delete({ where: { id } });
    } catch (error) {
        console.error('Failed to delete modelConfig by id in database');
        throw error;
    }
}

export async function saveModelConfig(models: ModelConfig) {
    try {
        if (!models.id) {
            models.id = nanoid(12);
        }
        return await db.modelConfig.upsert({ create: models, update: models, where: { id: models.id } });
    } catch (error) {
        console.error('Failed to create modelConfig in database');
        throw error;
    }
}
