'use server';
import { db } from '@/server/db';

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

type ChunkNode = {
    id: string;
    label: string;
    type?: 'chunk';
    size?: number;
    style?: { fill: string };
};

type ChunkEdge = {
    source: string;
    target: string;
    label: string;
    weight: number;
};

export async function insertChunkGraph(chunkId: string, entities: EntityInput[], relations: RelationInput[]) {
    try {
        await db.chunkEntities.createMany({
            data: entities.map(e => ({
                chunkId,
                type: e.type,
                value: e.name,
                normalized_value: e.id
            }))
        });
        await db.chunkRelations.createMany({
            data: relations.map(r => ({
                sourceEntityId: r.source,
                targetEntityId: r.target,
                relationType: r.relation
            }))
        });
    } catch (error) {
        console.error('Failed to create graph by id in database');
        throw error;
    }
}

function getCommonEntities(setA: Set<string>, setB: Set<string>): string[] {
    return [...setA].filter(e => setB.has(e));
}

export async function getChunkGraph(
    projectId: string,
    fileIds?: string[]
): Promise<{
    nodes: ChunkNode[];
    edges: ChunkEdge[];
}> {
    const whereClause: any = { projectId };
    if (fileIds && fileIds.length > 0) {
        whereClause.documentId = { in: fileIds };
    }

    const chunks = await db.chunks.findMany({
        where: whereClause,
        include: {
            ChunkEntities: true
        }
    });

    if (chunks.length === 0) {
        return { nodes: [], edges: [] };
    }

    // 构建 chunkId -> entities 映射
    const chunkEntityMap = new Map<string, Set<string>>();
    for (const chunk of chunks) {
        const entities = chunk.ChunkEntities.map(e => e.normalized_value);
        chunkEntityMap.set(chunk.id, new Set(entities));
    }

    const edges: ChunkEdge[] = [];

    // 构建 Chunk 共现关系
    for (let i = 0; i < chunks.length; i++) {
        for (let j = i + 1; j < chunks.length; j++) {
            const chunkA = chunks[i];
            const chunkB = chunks[j];
            if (!chunkA || !chunkB) continue;
            const entitiesA = chunkEntityMap.get(chunkA.id);
            const entitiesB = chunkEntityMap.get(chunkB.id);

            if (!entitiesA || !entitiesB) continue;

            const common = getCommonEntities(entitiesA, entitiesB);

            if (common.length >= 2) {
                edges.push({
                    source: chunkA.id,
                    target: chunkB.id,
                    label: `共有 ${common.length} 个实体`,
                    weight: common.length
                });
            }
        }
    }

    const nodes: ChunkNode[] = chunks.map(chunk => ({
        id: chunk.id,
        label: chunk.name || '未知文件块',
        type: 'chunk'
    }));

    return {
        nodes,
        edges
    };
}

// export async function getChunkGraphTag(projectId: string) {
//     try {
//         const chunks = await db.chunks.findMany({where: {projectId}})
//         const chunkIds = chunks.map(chunk => chunk.id)
//         const entities = await db.chunkEntities.findMany({
//             where: {chunkId: {in: chunkIds}}, select: {
//                 id: true,
//                 value: true,
//                 normalized_value: true,
//             }
//         });
//         const relations = await db.chunkRelations.findMany()
//         return {entities, relations}
//     } catch (error) {
//         console.error('Failed to get graph by id in database');
//         throw error;
//     }
// }
