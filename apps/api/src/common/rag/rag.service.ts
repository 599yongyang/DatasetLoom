import { Injectable, Logger } from '@nestjs/common';
import { QdrantService } from '@/common/rag/serivce/qdrant.service';
import { RerankerService, RerankResult } from '@/common/rag/serivce/reranker.service';
import { randomUUID } from 'crypto';
import { Chunks } from '@prisma/client';
import { AIService } from '@/common/ai/ai.service';
import { ModelConfigService } from '@/setting/model-config/model-config.service';


// 定义搜索选项
interface RagSearchOptions {
    topK?: number;
    withRerank?: boolean;
    rerankTopK?: number;
}

@Injectable()
export class RagService {

    private readonly logger = new Logger(RagService.name);

    constructor(
        private readonly aiService: AIService,
        private readonly qdrantService: QdrantService,
        private readonly rerankerService: RerankerService,
        private readonly modelConfigService: ModelConfigService
    ) {
    }

    /**
     * 存储文档到向量数据库
     * @param projectId 项目Id
     * @param chunks 文档内容
     */
    async insertVectorData(projectId: string, chunks: Chunks[]): Promise<void> {
        const modelConfig = await this.modelConfigService.getEmbedModelConfigByProjectId(projectId);
        // 1. 向量化数据
        const batchSize = 5; // 控制并发数量
        const vectorData: any = [];
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(async (chunk) => {
                    try {
                        const embedding = await this.aiService.embedding(modelConfig, chunk.content);
                        return {
                            id: randomUUID(),
                            vector: embedding,
                            payload: {
                                chunkId: chunk.id,
                                documentId: chunk.documentId,
                                projectId: chunk.projectId,
                                content: chunk.content
                            }
                        };
                    } catch (embeddingError) {
                        this.logger.error(`Failed to generate embedding for chunk ${chunk.id}:`, embeddingError);
                        throw new Error(`Embedding generation failed for chunk ${chunk.id}`);
                    }
                })
            );
            vectorData.push(...batchResults);
        }

        if (!vectorData || vectorData.length == 0) {
            this.logger.warn('没有需要向量化的文档');
            return;
        }
        // 2. 存储向量化
        await this.qdrantService.upsert(projectId, modelConfig.modelId, vectorData);
    }


    /**
     * RAG 查询
     * @param projectId 项目Id
     * @param query 查询文本
     * @param options 查询选项
     * @returns 查询结果
     */
    async query(projectId: string, query: string, options: RagSearchOptions = {}): Promise<RerankResult[]> {

        const { topK = 10, withRerank = true, rerankTopK = 3 } = options;

        const modelConfig = await this.modelConfigService.getEmbedModelConfigByProjectId(projectId);

        // 1. 向量搜索
        const embedding = await this.aiService.embedding(modelConfig, query);
        const results = await this.qdrantService.search(projectId, modelConfig.modelId, embedding, withRerank ? rerankTopK : topK);
        // 2. 提取文档内容
        const documents = results.map(result =>
            result.payload?.content || ''
        ).filter(content => content && content.trim().length > 0);

        // 3. 重排序
        const rerankedResults = await this.rerankerService.rerank(
            query,
            documents,
            topK
        );
        return rerankedResults;

    }

    /**
     * 删除文档
     * @param collection 集合名称
     * @param documentId 文档ID
     */
    async deleteDocument(collection: string, documentId: string): Promise<void> {
        await this.qdrantService.delete(collection, [documentId]);
    }
}
