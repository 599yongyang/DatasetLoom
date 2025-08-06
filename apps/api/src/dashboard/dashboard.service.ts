import {Injectable} from '@nestjs/common';
import {PrismaService} from "@/common/prisma/prisma.service";

@Injectable()
export class DashboardService {

    constructor(private readonly prisma: PrismaService,) {
    }

    async getChunkDomain(projectId: string, level: 'domain' | 'subDomain' = 'domain') {
        try {
            // 获取当前项目的所有 ChunkMetadata 总数
            const totalCount = await this.prisma.chunks.count({
                where: {
                    projectId,
                    domain: {
                        not: ''
                    }
                }
            });
            if (totalCount === 0) {
                return [];
            }
            const domainCounts = await this.prisma.chunks.groupBy({
                by: [level],
                _count: {
                    id: true
                },
                where: {projectId, domain: {not: ''}}
            });
            const result = domainCounts.map(item => {
                const percentage = ((item._count.id / totalCount) * 100).toFixed(1);
                return {
                    domain: level === 'domain' ? item.domain : item.subDomain,
                    count: item._count.id,
                    value: parseFloat(percentage)
                };
            });

            return result;
        } catch (error) {
            console.error('Failed to get chunkMetadata in database');
            throw error;
        }
    }


    async datasetKanbanData(projectId: string) {
        try {
            const [confirmedCount, allCount, sftCount, cotCount, dpoCount] = await Promise.all([
                this.prisma.datasetSamples.count({
                    where: {
                        projectId,
                        questions: {
                            confirmed: true
                        }
                    }
                }),
                this.prisma.datasetSamples.count({where: {projectId}}),
                this.prisma.datasetSamples.count({
                    where: {
                        projectId,
                        isPrimaryAnswer: true
                    }
                }),
                this.prisma.datasetSamples.count({
                    where: {
                        projectId,
                        cot: {not: ''}
                    }
                }),
                this.prisma.preferencePair.count({where: {projectId}})
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
}
