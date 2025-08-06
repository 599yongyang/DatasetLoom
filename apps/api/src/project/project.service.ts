import {Injectable} from '@nestjs/common';
import {CreateProjectDto} from './dto/create-project.dto';
import {UpdateProjectDto} from './dto/update-project.dto';
import {PrismaService} from '@/common/prisma/prisma.service';
import {nanoid} from 'nanoid';
import {ProjectRole} from '@/common/prisma/enum';
import {DEFAULT_PROVIDERS} from "@/constants/model";

@Injectable()
export class ProjectService {
    constructor(private readonly prisma: PrismaService) {
    }

    async create(createProjectDto: CreateProjectDto, userId: string) {
        try {
            const projectId = nanoid(12);


            const providers = DEFAULT_PROVIDERS.map(provider => {
                return {id: nanoid(), ...provider, projectId: projectId, apiKey: ''}
            })


            // 使用 Prisma 事务确保数据库操作的原子性
            const [project, projectMember] = await this.prisma.$transaction([
                this.prisma.projects.create({
                    data: {
                        id: projectId,
                        name: createProjectDto.name,
                        description: createProjectDto.description || '',
                        ownerId: userId,
                    },
                }),
                this.prisma.projectMember.create({
                    data: {
                        projectId: projectId,
                        userId: userId,
                        role: ProjectRole.OWNER,
                    },
                }),
                this.prisma.modelProviders.createMany({data: providers})
            ]);

            return project;
        } catch (error) {
            console.error('Failed to create project:', error);
            throw error;
        }
    }

    async getList(name: string | undefined, userId: string) {
        try {
            return await this.prisma.projects.findMany({
                where: {
                    name: {
                        contains: name,
                    },
                    OR: [{ownerId: userId}, {members: {some: {userId: userId}}}],
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    ownerId: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            DatasetSamples: true,
                            Questions: true,
                            ModelConfig: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        } catch (error) {
            console.error('Failed to get projects in database');
            throw error;
        }
    }

    getInfoById(projectId: string) {
        try {
            return this.prisma.projects.findUnique({where: {id: projectId}});
        } catch (error) {
            console.error('Failed to get project by id in database');
            throw error;
        }
    }

    update(id: string, updateProjectDto: UpdateProjectDto) {
        try {
            return this.prisma.projects.update({
                where: {id},
                data: {...updateProjectDto},
            });
        } catch (error) {
            console.error('Failed to update project in database');
            throw error;
        }
    }

    async remove(id: string) {
        try {
            await this.prisma.projects.delete({where: {id}});
            return true;
        } catch (error) {
            return false;
        }
    }

    async checkNameIsUnique(name: string, userId: string) {
        try {
            const count = await this.prisma.projects.count({
                where: {
                    name: name,
                    ownerId: userId,
                },
            });
            return count > 0;
        } catch (error) {
            console.error('Failed to get project by name in database');
            throw error;
        }
    }

    async copyModelConfig(newProjectId: string, copyProjectId: string) {
        try {
            await this.prisma.$transaction(async tx => {
                // Step 1: 获取源项目下的所有 provider
                const providers = await tx.modelProviders.findMany({
                    where: {projectId: copyProjectId},
                });

                if (!providers.length) return;

                // Step 2: 批量复制 providers 并保留旧 id 映射
                const providerIdMap: Record<string, string> = {};

                const providerCreateOperations = providers.map(provider => {
                    const newProviderId = nanoid();
                    providerIdMap[provider.id] = newProviderId;
                    return tx.modelProviders.create({
                        data: {
                            ...provider,
                            id: newProviderId,
                            projectId: newProjectId,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    });
                });

                await Promise.all(providerCreateOperations);

                // Step 3: 获取所有 modelConfigs（一次性批量获取）
                const providerIds = providers.map(p => p.id);
                const modelConfigs = await tx.modelConfig.findMany({
                    where: {providerId: {in: providerIds}},
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
                            updatedAt: new Date(),
                        },
                    });
                });

                await Promise.all(modelConfigCreateOperations);
            });
        } catch (error) {
            console.error('Failed to copy modelConfig in database');
            throw error;
        }
    }

}
