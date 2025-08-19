import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService implements OnModuleInit {
    private client: QdrantClient;

    async onModuleInit() {
        this.client = new QdrantClient({
            url: process.env.QDRANT_URL ?? 'http://localhost:6333'
        });
    }

    async upsert(projectId: string, modelId: string, points: {
        id: string | number;
        vector: number[];
        payload?: any
    }[], vectorConfig?: { distance?: 'Cosine' | 'Euclid' | 'Dot' }): Promise<void> {
        if (points.length === 0) {
            return;
        }

        // 从实际向量中获取维度
        const vectorSize = points[0].vector.length;
        const distance = vectorConfig?.distance || 'Cosine';
        const exists = await this.collectionExists(projectId, modelId);
        if (!exists) {
            try {
                // 尝试创建集合，如果已存在会抛出异常
                await this.client.createCollection(this.formatCollectionName(projectId, modelId), {
                    vectors: {
                        size: vectorSize,
                        distance: distance
                    }
                });
                // 等待一小段时间确保集合创建完成
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                // 忽略集合已存在的错误
                if (!(error instanceof Error && error.message.includes('already exists'))) {
                    // 重新抛出其他错误
                    throw error;
                }
            }
        }
        // 执行upsert操作
        await this.client.upsert(this.formatCollectionName(projectId, modelId), {
            points: points.map(p => ({
                id: p.id,
                vector: p.vector,
                payload: p.payload
            }))
        });
    }


    /**
     * 检查集合是否存在
     */
    async collectionExists(projectId: string, modelId: string): Promise<boolean> {
        try {
            await this.client.getCollection(this.formatCollectionName(projectId, modelId));
            return true;
        } catch (error) {
            // 如果是 404 错误，说明集合不存在
            if (error.status === 404) {
                return false;
            }
            // 其他错误重新抛出
            throw error;
        }
    }


    async search(projectId: string, modelId: string, vector: number[], topK: number): Promise<any[]> {
        return await this.client.search(this.formatCollectionName(projectId, modelId), {
            vector,
            limit: topK,
            filter: {
                must: [
                    { key: 'projectId', match: { value: projectId } }
                ]
            }
        });
    }

    private formatCollectionName(projectId: string, modelId: string): string {
        // 使用双下划线替代冒号，保持可读性
        return `${projectId}__${modelId}`.replace(/:/g, '__');
    }

    async delete(collection: string, ids: string[]): Promise<void> {
        await this.client.delete(collection, { points: ids });
    }
}
