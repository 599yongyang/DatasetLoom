import {Injectable} from '@nestjs/common';
import {startOfDay, endOfDay, format} from 'date-fns';
import {PrismaService} from "@/common/prisma/prisma.service";
import {ModelUsage} from '@prisma/client';

@Injectable()
export class ModelUsageService {

    constructor(private readonly prisma: PrismaService,) {
    }

    insertModelUsage(data: ModelUsage) {
        try {
            return this.prisma.modelUsage.create({data: data});
        } catch (error) {
            console.error('Failed to create ModelUsage in database');
            throw error;
        }
    }

    async getModelUsageList(projectId: string, modelConfigId: string, day: number) {
        return await Promise.all(
            Array.from({length: day}, (_, i) => i).map(async day => {
                const date = new Date();
                date.setDate(date.getDate() - day);
                return await this.getModelUsage(projectId, modelConfigId, date);
            })
        );
    }

    async getModelUseRank(projectId: string) {
        try {
            const result = await this.prisma.modelUsage.groupBy({
                by: ['modelConfigId'],
                where: {
                    projectId,
                    modelConfigId: {not: ''}
                },
                _count: {
                    _all: true
                },
                orderBy: {
                    _count: {
                        modelConfigId: 'desc'
                    }
                },
                take: 5
            });

            const modelConfigs = await this.prisma.modelConfig.findMany({
                where: {
                    id: {in: result.map(item => item.modelConfigId)}
                },
                select: {
                    id: true,
                    modelId: true,
                    modelName: true
                }
            });

            return result.map(item => {
                const config = modelConfigs.find(c => c.id === item.modelConfigId);
                return {
                    modelId: config?.modelId || 'unknown',
                    modelName: config?.modelName || 'Unknown Model',
                    usageCount: item._count?._all || 0
                };
            });
        } catch (error) {
            console.error(`Failed to get model usage rank for project ${projectId}:`, error);
            throw new Error(
                `Failed to retrieve model usage statistics: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }


    private async getModelUsage(projectId: string, modelConfigId: string, date: Date) {
        try {
            const start = startOfDay(date);
            const end = endOfDay(date);
            const stats = await this.prisma.modelUsage.aggregate({
                where: {
                    projectId,
                    modelConfigId,
                    createdAt: {
                        gte: start,
                        lte: end
                    }
                },
                _count: {
                    _all: true
                },
                _sum: {
                    promptTokens: true,
                    completionTokens: true,
                    totalTokens: true
                }
            });

            return {
                date: format(date, 'yyyy-MM-dd'),
                monthDay: format(date, 'MM-dd'),
                count: stats._count._all,
                promptTokens: stats._sum.promptTokens || 0,
                completionTokens: stats._sum.completionTokens || 0,
                totalTokens: stats._sum.totalTokens || 0
            };
        } catch (error) {
            console.error('Failed to get ModelUsage from database');
            throw error;
        }
    }

}
