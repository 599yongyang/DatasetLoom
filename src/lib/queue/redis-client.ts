import Redis from 'ioredis';
import type { RedisConfig } from './types';

export class RedisClient {
    private static instance: Redis;
    private static config: RedisConfig;

    static initialize(config: RedisConfig) {
        this.config = config;
    }

    static getInstance(): Redis {
        if (!this.instance) {
            this.instance = new Redis({
                ...this.config,
                maxRetriesPerRequest: null,
                retryStrategy: () => null,
                connectTimeout: 2000
            });

            this.setupEventListeners();
        }
        return this.instance;
    }

    private static setupEventListeners() {
        this.instance
            .on('ready', () => console.log('[Redis] 连接就绪'))
            .on('error', err => console.error('[Redis] 连接错误:', err.message))
            .on('end', () => console.log('[Redis] 连接关闭'));
    }

    static async disconnect() {
        if (this.instance) {
            await this.instance.quit();
            this.instance = null!;
        }
    }
}
