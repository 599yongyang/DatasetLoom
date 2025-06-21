import type { RedisConfig } from './types';
import { RedisClient } from './redis-client';
import { QueueService } from './queue-service';

export function initializeQueue(config: RedisConfig): Promise<QueueService> {
    RedisClient.initialize(config);
    return QueueService.getInstance();
}

// 默认导出初始化后的实例
const queueService = initializeQueue({
    host: process.env.REDIS_URL || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    ...(process.env.REDIS_TLS === 'true' ? { tls: {} } : {})
});

export default queueService;
