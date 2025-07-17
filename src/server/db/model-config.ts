'use server';
import { nanoid } from 'nanoid';
import { db } from '@/server/db/db';
import type { ModelConfig } from '@prisma/client';

export async function getModelConfig(providerId: string[], status: boolean | undefined) {
    try {
        const whereClause = {
            providerId: { in: providerId },
            ...(status !== undefined && { status })
        };

        return await db.modelConfig.findMany({
            where: whereClause,
            select: {
                id: true,
                modelId: true,
                modelName: true,
                status: true,
                isDefault: true,
                temperature: true,
                maxTokens: true,
                type: true,
                provider: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }]
        });
    } catch (error) {
        console.error('Failed to get modelConfig by projectId in database');
        throw error;
    }
}

export async function copyModelConfig(newProjectId: string, copyProjectId: string) {
    try {
        await db.$transaction(async tx => {
            // Step 1: 获取源项目下的所有 provider
            const providers = await tx.llmProviders.findMany({
                where: { projectId: copyProjectId }
            });

            if (!providers.length) return;

            // Step 2: 批量复制 providers 并保留旧 id 映射
            const providerIdMap: Record<string, string> = {};

            const providerCreateOperations = providers.map(provider => {
                const newProviderId = nanoid();
                providerIdMap[provider.id] = newProviderId;
                return tx.llmProviders.create({
                    data: {
                        ...provider,
                        id: newProviderId,
                        projectId: newProjectId,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
            });

            await Promise.all(providerCreateOperations);

            // Step 3: 获取所有 modelConfigs（一次性批量获取）
            const providerIds = providers.map(p => p.id);
            const modelConfigs = await tx.modelConfig.findMany({
                where: { providerId: { in: providerIds } }
            });

            if (!modelConfigs.length) return;

            // Step 4: 批量创建 modelConfigs
            const modelConfigCreateOperations = modelConfigs.map(config => {
                const newProviderId = providerIdMap[config.providerId];
                if (!newProviderId) return;
                return tx.modelConfig.create({
                    data: {
                        ...config,
                        id: nanoid(),
                        providerId: newProviderId,
                        projectId: newProjectId,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
            });

            await Promise.all(modelConfigCreateOperations);
        });
    } catch (error) {
        console.error('Failed to copy modelConfig in database');
        throw error;
    }
}

export async function getModelConfigById(id: string) {
    try {
        return await db.modelConfig.findUnique({ where: { id }, include: { provider: true } });
    } catch (error) {
        console.error('Failed to get modelConfig by id in database');
        throw error;
    }
}

export async function getDefaultModelConfig(projectId: string) {
    try {
        return await db.modelConfig.findFirst({ where: { projectId, isDefault: true }, include: { provider: true } });
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

export async function updateModelConfigStatus(modelId: string, status: boolean) {
    try {
        return await db.modelConfig.update({ where: { id: modelId }, data: { status } });
    } catch (error) {
        console.error('Failed to create modelConfig in database');
        throw error;
    }
}

export async function updateModelConfigDefault(id: string) {
    try {
        const model = await db.modelConfig.findUnique({ where: { id } });
        if (model) {
            await db.modelConfig.updateMany({
                where: { providerId: model.providerId },
                data: { isDefault: false }
            });
            return await db.modelConfig.update({ where: { id }, data: { isDefault: true } });
        }
    } catch (error) {
        console.error('Failed to create modelConfig in database');
        throw error;
    }
}

export async function getModelConfigByType(projectId: string, type: string | 'tool' | 'vision' | 'cot') {
    try {
        return await db.modelConfig.findMany({ where: { projectId, type }, include: { provider: true } });
    } catch (error) {
        console.error('Failed to get modelConfig in database');
        throw error;
    }
}
