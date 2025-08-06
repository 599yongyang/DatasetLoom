import {Injectable} from '@nestjs/common';
import {PrismaService} from '@/common/prisma/prisma.service';

interface EntityInput {
    id: string;
    name: string;
    type: string;
}

interface RelationInput {
    source: string;
    target: string;
    relation: string;
}

@Injectable()
export class DocumentChunkGraphService {

    constructor(private readonly prisma: PrismaService) {
    }

    async createChunkGraph(chunkId: string, entities: EntityInput[], relations: RelationInput[]) {
        if (!entities || !relations) {
            throw new Error('Entities and relations must be provided');
        }

        return this.prisma.$transaction(async tx => {
            try {
                await tx.chunkEntities.deleteMany({
                    where: {
                        chunkId: chunkId
                    }
                });

                // 1. 先创建所有实体，并返回创建的记录
                const createdEntities = await Promise.all(
                    entities.map(e =>
                        tx.chunkEntities.create({
                            data: {
                                chunkId: chunkId,
                                type: e.type,
                                value: e.name,
                                normalizedValue: e.id
                            }
                        })
                    )
                );

                // 2. 建立实体ID映射表 (inputId -> databaseId)
                const entityIdMap = new Map(entities.map((e, index) => [e.id, createdEntities[index]?.id]));

                // 3. 过滤并创建有效关系
                const validRelations = relations.filter(r => {
                    const valid = entityIdMap.has(r.source) && entityIdMap.has(r.target);
                    if (!valid) {
                        console.warn(`Invalid relation skipped: source=${r.source} target=${r.target}`);
                    }
                    return valid;
                });

                const createdRelations = await tx.chunkRelation.createMany({
                    data: validRelations.map(r => ({
                        sourceEntityId: entityIdMap.get(r.source)!,
                        targetEntityId: entityIdMap.get(r.target)!,
                        relationType: r.relation
                    }))
                });

                return {
                    entityCount: createdEntities.length,
                    relationCount: createdRelations.count
                };
            } catch (error) {
                console.error('Failed to create chunk with relations', error);
                throw new Error('Database operation failed');
            }
        });
    }

    async getChunkGraph(projectId: string, fileIds?: string[], options = {limit: 1000}) {
        try {
            // 1. 查询 chunks，只获取需要的 chunkId 列表
            const chunkList = await this.prisma.chunks.findMany({
                where: {
                    projectId,
                    ...(fileIds?.length ? {documentId: {in: fileIds}} : {})
                },
                select: {id: true}
            });

            const chunkIds = chunkList.map(chunk => chunk.id);

            if (chunkIds.length === 0) {
                return {nodes: [], edges: []};
            }

            // 2. 分页查询实体及其相关信息
            const entities = await this.prisma.chunkEntities.findMany({
                where: {
                    chunkId: {in: chunkIds}
                },
                take: options.limit,
                include: {
                    // 包含关联的chunk基本信息
                    chunk: {
                        select: {
                            documentName: true,
                            domain: true,
                            subDomain: true
                        }
                    }
                }
            });

            // 3. 获取相关实体ID（使用数据库ID而非normalizedValue）
            const entityDbIds = entities.map(e => e.id);

            // 4. 查询关系（包含完整的关系信息）
            const relations = await this.prisma.chunkRelation.findMany({
                where: {
                    OR: [{sourceEntityId: {in: entityDbIds}}, {targetEntityId: {in: entityDbIds}}]
                },
                include: {
                    sourceEntity: {
                        select: {
                            type: true,
                            value: true,
                            normalizedValue: true
                        }
                    },
                    targetEntity: {
                        select: {
                            type: true,
                            value: true,
                            normalizedValue: true
                        }
                    }
                }
            });

            // 5. 转换为前端图谱格式
            return {
                nodes: entities.map(entity => ({
                    id: entity.id,
                    type: entity.type,
                    name: entity.value,
                    normalizedName: entity.normalizedValue,
                    metadata: {
                        domain: entity.chunk.domain,
                        subDomain: entity.chunk.subDomain,
                        document: entity.chunk.documentName,
                        chunkId: entity.chunkId
                    }
                })),
                edges: relations.map(relation => ({
                    id: relation.id,
                    source: relation.sourceEntityId,
                    target: relation.targetEntityId,
                    label: relation.relationType,
                    // 添加关系相关的元数据
                    metadata: {
                        sourceType: relation.sourceEntity.type,
                        targetType: relation.targetEntity.type,
                        sourceName: relation.sourceEntity.value,
                        targetName: relation.targetEntity.value
                    }
                }))
            };
        } catch (error) {
            console.error('Failed to fetch knowledge graph data:', error);
            throw new Error('Knowledge graph query failed');
        }
    }
}
