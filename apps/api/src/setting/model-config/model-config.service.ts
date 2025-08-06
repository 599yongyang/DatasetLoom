import {Injectable} from '@nestjs/common';
import {SaveModelConfigDto} from './dto/save-model-config.dto';
import {PrismaService} from '@/common/prisma/prisma.service';
import {ModelConfigWithProvider} from '@/common/prisma/type';
import {nanoid} from "nanoid";

@Injectable()
export class ModelConfigService {
    constructor(private readonly prisma: PrismaService) {
    }

    save(modelConfigDto: SaveModelConfigDto) {
        try {
            if (!modelConfigDto.id) {
                modelConfigDto.id = nanoid(12);
            }
            return this.prisma.modelConfig.upsert({
                create: modelConfigDto,
                update: modelConfigDto,
                where: {id: modelConfigDto.id}
            });
        } catch (error) {
            console.error('Failed to create modelConfig in database');
            throw error;
        }
    }

    getList(projectId: string, providerId: string) {
        try {
            return this.prisma.modelConfig.findMany({
                where: {projectId, providerId},
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
                            name: true,
                        },
                    },
                },
                orderBy: [{isDefault: 'desc'}, {updatedAt: 'desc'}],
            });
        } catch (error) {
            console.error('Failed to get modelConfig by projectId in database');
            throw error;
        }
    }

    getAvailableList(projectId: string, status: boolean) {
        try {
            return this.prisma.modelConfig.findMany({
                where: {projectId, status},
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
                            name: true,
                        },
                    },
                },
                orderBy: [{isDefault: 'desc'}, {updatedAt: 'desc'}],
            });
        } catch (error) {
            console.error('Failed to get modelConfig by projectId in database');
            throw error;
        }
    }

    updateStatus(modelId: string, status: boolean) {
        try {
            return this.prisma.modelConfig.update({where: {id: modelId}, data: {status}});
        } catch (error) {
            console.error('Failed to create modelConfig in database');
            throw error;
        }
    }

    async updateDefault(id: string) {
        try {
            const model = await this.prisma.modelConfig.findUnique({where: {id}});
            if (model) {
                await this.prisma.modelConfig.updateMany({
                    where: {providerId: model.providerId},
                    data: {isDefault: false}
                });
                return await this.prisma.modelConfig.update({where: {id}, data: {isDefault: true}});
            }
        } catch (error) {
            console.error('Failed to create modelConfig in database');
            throw error;
        }
    }

    async getModelConfigById(id: string): Promise<ModelConfigWithProvider> {
        try {
            const modelConfig = await this.prisma.modelConfig.findUnique({
                where: {id},
                include: {provider: true},
            });

            if (!modelConfig) {
                throw new Error(`ModelConfig with id ${id} not found`);
            }

            return modelConfig;
        } catch (error) {
            console.error('Failed to get modelConfig by id in database');
            throw error;
        }
    }


    remove(id: string) {
        try {
            return this.prisma.modelConfig.delete({where: {id}});
        } catch (error) {
            console.error('Failed to delete modelConfig by id in database');
            throw error;
        }
    }
}
