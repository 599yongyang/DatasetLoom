import {
    AutoTokenizer,
    AutoModelForSequenceClassification,
    PreTrainedTokenizer,
    PreTrainedModel,
    env
} from '@huggingface/transformers';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

env.remoteHost = 'https://hf-mirror.com';
const MODEL_CACHE_DIR = process.env.MODEL_CACHE_DIR ||
    (process.env.NODE_ENV === 'production' ? '/app/models' : './models');
env.cacheDir = MODEL_CACHE_DIR;

export interface RerankResult {
    doc: string;
    rerankScore: number;
}

interface ModelStatus {
    isReady: boolean;
    isLoading: boolean;
    lastError?: string;
}

@Injectable()
export class RerankerService implements OnModuleInit {
    private tokenizer: PreTrainedTokenizer | null = null;
    private model: PreTrainedModel | null = null;
    private loadingPromise: Promise<void> | null = null;
    private readonly modelName = 'cross-encoder/ms-marco-MiniLM-L-6-v2';
    private readonly batchSize = 8;
    private readonly logger = new Logger(RerankerService.name);
    private readonly statusFile = path.join(MODEL_CACHE_DIR, '.model_status.json');

    async onModuleInit(): Promise<void> {
        // 启动时异步尝试加载模型
        this.startAsyncLoad();
    }

    private startAsyncLoad(): void {
        this.loadingPromise = this.loadModel()
            .then(() => {
                this.logger.log('重排模型异步加载完成');
                void this.saveStatus({ isReady: true, isLoading: false });
            })
            .catch(error => {
                this.logger.error('重排模型异步加载失败:', error.message);
                void this.saveStatus({
                    isReady: false,
                    isLoading: false,
                    lastError: error.message
                });
                this.loadingPromise = null; // 允许重试
            });
    }

    private async loadModel(): Promise<void> {
        // 先尝试加载现有模型
        if (await this.tryLoadExistingModel()) {
            return;
        }

        // 现有模型加载失败，清理后重新下载
        this.logger.log('现有重排模型不可用，重新下载...');
        await this.cleanupModel();
        await this.downloadAndLoadModel();
    }

    private async tryLoadExistingModel(): Promise<boolean> {
        try {
            this.logger.log('尝试加载现有重排模型...');

            this.tokenizer = await AutoTokenizer.from_pretrained(this.modelName);
            this.model = await AutoModelForSequenceClassification.from_pretrained(this.modelName);

            // 快速验证模型是否可用
            await this.validateModel();

            this.logger.log('现有重排模型加载成功');
            return true;
        } catch (error) {
            this.logger.warn('现有重排模型加载失败:', error instanceof Error ? error.message : String(error));
            this.resetModel();
            return false;
        }
    }

    private async downloadAndLoadModel(): Promise<void> {
        this.logger.log('开始下载重排模型...');

        this.tokenizer = await AutoTokenizer.from_pretrained(this.modelName);
        this.model = await AutoModelForSequenceClassification.from_pretrained(this.modelName);

        await this.validateModel();
        this.logger.log('重排模型下载并加载完成');
    }

    private async validateModel(): Promise<void> {
        if (!this.tokenizer || !this.model) {
            throw new Error('Model or tokenizer is null');
        }

        // 简单的功能测试
        const inputs = await this.tokenizer([['test', 'test document']], {
            truncation: true,
            padding: true,
            max_length: 512,
            return_tensors: 'pt'
        });

        const outputs = await this.model(inputs);

        if (!outputs?.logits) {
            throw new Error('Model validation failed: no valid output');
        }
    }

    private async cleanupModel(): Promise<void> {
        try {
            const modelPaths = [
                path.join('./models', this.modelName.replace('/', '--')),
                path.join('./models', this.modelName),
                path.join('./models', 'cross-encoder', 'ms-marco-MiniLM-L-6-v2')
            ];

            for (const modelPath of modelPaths) {
                if (fs.existsSync(modelPath)) {
                    fs.rmSync(modelPath, { recursive: true, force: true });
                    this.logger.log(`已清理模型路径: ${modelPath}`);
                }
            }
        } catch (error) {
            this.logger.warn('清理模型文件时出错:', error);
        }
    }

    private resetModel(): void {
        this.tokenizer = null;
        this.model = null;
    }

    private async saveStatus(status: ModelStatus): Promise<void> {
        try {
            const statusDir = path.dirname(this.statusFile);
            if (!fs.existsSync(statusDir)) {
                fs.mkdirSync(statusDir, { recursive: true });
            }
            fs.writeFileSync(this.statusFile, JSON.stringify(status, null, 2));
        } catch (error) {
            // 状态文件写入失败不应该影响主功能
        }
    }

    async rerank(query: string, documents: string[], topK: number = 10): Promise<RerankResult[]> {
        if (!Array.isArray(documents) || documents.length === 0) {
            return [];
        }

        // 确保模型已加载
        await this.ensureModelReady();

        const results: RerankResult[] = [];

        // 分批处理
        for (let i = 0; i < documents.length; i += this.batchSize) {
            const batch = documents.slice(i, i + this.batchSize);
            const batchScores = await this.processBatch(query, batch);

            batch.forEach((doc, index) => {
                if (doc?.trim()) {
                    results.push({
                        doc,
                        rerankScore: batchScores[index]
                    });
                }
            });
        }

        return results
            .sort((a, b) => b.rerankScore - a.rerankScore)
            .slice(0, topK);
    }

    private async ensureModelReady(): Promise<void> {
        // 如果模型已就绪，直接返回
        if (this.tokenizer && this.model) {
            return;
        }

        // 如果正在加载，等待完成
        if (this.loadingPromise) {
            this.logger.log('等待模型加载完成...');
            await this.loadingPromise;
        }

        // 如果仍未就绪，同步加载
        if (!this.tokenizer || !this.model) {
            this.logger.log('同步加载模型...');
            await this.loadModel();
        }

        if (!this.tokenizer || !this.model) {
            throw new Error('模型加载失败');
        }
    }

    private async processBatch(query: string, batch: string[]): Promise<number[]> {
        if (!this.tokenizer || !this.model) {
            throw new Error('Model not ready');
        }

        const validDocs = batch.filter(doc => doc?.trim());
        if (validDocs.length === 0) {
            return new Array(batch.length).fill(0);
        }

        try {
            const pairs = validDocs.map(doc => [query, doc]);
            const inputs = await this.tokenizer(pairs, {
                truncation: true,
                padding: true,
                max_length: 512,
                return_tensors: 'pt'
            });

            const outputs = await this.model(inputs);
            const logits = outputs.logits?.data;

            if (!logits) {
                return new Array(batch.length).fill(0);
            }

            // 处理不同的 logits 格式
            let logitsArray: number[];
            if (Array.isArray(logits)) {
                logitsArray = logits;
            } else if (logits.constructor?.name === 'Float32Array') {
                logitsArray = Array.from(logits);
            } else {
                logitsArray = [Number(logits)];
            }

            const scores = logitsArray.map(logit => this.sigmoid(logit));

            // 映射回原始批次顺序
            const resultScores: number[] = [];
            let scoreIndex = 0;

            for (const doc of batch) {
                if (doc?.trim()) {
                    resultScores.push(Math.max(0, Math.min(1, scores[scoreIndex++] || 0)));
                } else {
                    resultScores.push(0);
                }
            }

            return resultScores;
        } catch (error) {
            this.logger.error('批处理失败:', error);
            return new Array(batch.length).fill(0);
        }
    }

    private sigmoid(x: number): number {
        if (x < -88) return 0;
        if (x > 88) return 1;
        return 1 / (1 + Math.exp(-x));
    }

    /**
     * 获取模型状态
     */
    getModelStatus(): {
        ready: boolean;
        loading: boolean;
        hasTokenizer: boolean;
        hasModel: boolean;
    } {
        return {
            ready: !!(this.tokenizer && this.model),
            loading: !!this.loadingPromise,
            hasTokenizer: !!this.tokenizer,
            hasModel: !!this.model
        };
    }

    /**
     * 手动重新加载模型
     */
    async forceReload(): Promise<void> {
        this.logger.log('手动重新加载模型...');
        this.resetModel();
        this.loadingPromise = null;
        await this.loadModel();
        void this.saveStatus({ isReady: true, isLoading: false });
    }
}
