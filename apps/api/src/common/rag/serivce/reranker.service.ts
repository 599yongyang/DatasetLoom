import {
    AutoTokenizer,
    AutoModelForSequenceClassification,
    PreTrainedTokenizer,
    PreTrainedModel,
    env
} from '@huggingface/transformers';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

env.remoteHost = 'https://hf-mirror.com';
env.cacheDir = './models';

export interface RerankResult {
    doc: string;
    rerankScore: number;
}

@Injectable()
export class RerankerService implements OnModuleInit {
    private tokenizer: PreTrainedTokenizer | null = null;
    private model: PreTrainedModel | null = null;
    private initialized = false;
    private readonly modelName = 'cross-encoder/ms-marco-MiniLM-L-6-v2';
    private readonly batchSize = 8;
    private readonly logger = new Logger(RerankerService.name);

    async onModuleInit(): Promise<void> {
        try {
            await this.initialize();
        } catch (error) {
            this.logger.error('Failed to initialize reranker model during module init', error);
        }
    }

    private async initialize(): Promise<void> {
        if (this.initialized) return;

        this.logger.log('正在加载重排模型...');

        try {
            this.tokenizer = await AutoTokenizer.from_pretrained(this.modelName);
            this.model = await AutoModelForSequenceClassification.from_pretrained(this.modelName);

            this.initialized = true;
            this.logger.log('重排模型加载完成');
        } catch (error) {
            this.logger.error('模型加载失败:', error);
            throw new Error(`Failed to load reranker model: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async rerank(query: string, documents: string[], topK: number = 10): Promise<RerankResult[]> {
        if (!Array.isArray(documents)) {
            throw new TypeError('Documents must be an array');
        }

        if (documents.length === 0) return [];

        if (!this.initialized) {
            await this.initialize();
        }

        this.logger.log(`重排 ${documents.length} 个文档...`);

        const results: RerankResult[] = [];

        // 分批处理以避免内存问题
        for (let i = 0; i < documents.length; i += this.batchSize) {
            const batch = documents.slice(i, i + this.batchSize);
            const batchScores = await this.processBatch(query, batch);

            batch.forEach((doc, index) => {
                if (doc != null && doc.trim().length > 0) {
                    const rerankScore = batchScores[index];
                    results.push({ doc, rerankScore });
                }
            });
        }

        // 排序并返回前 topK 个
        return results
            .sort((a, b) => b.rerankScore - a.rerankScore)
            .slice(0, Math.min(topK, results.length));
    }

    private async processBatch(query: string, batch: (string | null | undefined)[]): Promise<number[]> {
        if (!this.tokenizer || !this.model) {
            throw new Error('Model not initialized');
        }

        // 预处理批次数据
        const processedBatch = batch.map(content => {
            if (content == null) return '';
            return content;
        });

        // 过滤掉空内容，但保持索引对应关系
        const validEntries: { index: number; content: string }[] = [];
        processedBatch.forEach((content, index) => {
            if (content.trim().length > 0) {
                validEntries.push({ index, content });
            }
        });

        // 如果没有有效内容，返回默认分数
        if (validEntries.length === 0) {
            return new Array(batch.length).fill(0);
        }

        try {
            // 构造正确输入对格式
            const pairs = validEntries.map(entry => [query, entry.content]);

            // 分词
            const inputs = await this.tokenizer(pairs, {
                truncation: true,
                padding: true,
                max_length: 512,
                return_tensors: 'pt'
            });

            // 推理
            const outputs = await this.model(inputs);

            // 正确解析 logits
            let logits: any;
            if (outputs.logits && outputs.logits.data) {
                logits = outputs.logits.data;
            } else {
                this.logger.error('Unexpected logits format:', outputs);
                return new Array(batch.length).fill(0);
            }

            // 转换为数组格式
            let logitsArray: number[];
            if (Array.isArray(logits)) {
                logitsArray = logits;
            } else if (typeof logits === 'object' && logits.constructor.name === 'Float32Array') {
                logitsArray = Array.from(logits);
            } else if (typeof logits === 'number') {
                logitsArray = [logits];
            } else {
                this.logger.error('Unexpected logits type:', typeof logits, logits);
                return new Array(batch.length).fill(0);
            }

            // 应用 sigmoid 转换为概率分数
            const scores = logitsArray.map(logit => this.sigmoid(logit));

            // 构建完整批次的分数数组
            const resultScores = new Array(batch.length).fill(0);
            validEntries.forEach((entry, validIndex) => {
                if (validIndex < scores.length) {
                    resultScores[entry.index] = Math.max(0, Math.min(1, scores[validIndex]));
                }
            });

            // this.logger.log('批次分数:', scores);
            return resultScores;
        } catch (error) {
            this.logger.error('批处理失败:', error);
            return new Array(batch.length).fill(0);
        }
    }

    /**
     * Sigmoid函数，将logit转换为0-1之间的概率值
     */
    private sigmoid(x: number): number {
        // 防止溢出
        if (x < -88) return 0;
        if (x > 88) return 1;
        return 1 / (1 + Math.exp(-x));
    }
}
