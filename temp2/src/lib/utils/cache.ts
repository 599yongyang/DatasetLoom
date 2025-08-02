import { createHash } from 'crypto';
import { LRUCache } from 'lru-cache';

// 缓存最大容量：100 个任务，每个保留 5 分钟
const cache = new LRUCache<string, any>({
    max: 100,
    ttl: 1000 * 60 * 5 // 5分钟
});

export default cache;

/**
 * 根据分块配置生成唯一标识符
 */
export function generateChunkConfigHash(config: {
    fileIds: string[];
    strategy: string;
    separators: string[];
    chunkSize: number;
    chunkOverlap: number;
}): string {
    // 对数组排序确保顺序一致（避免 hash 不一致）
    const normalized = {
        fileIds: [...config.fileIds].sort(),
        strategy: config.strategy,
        separators: [...config.separators].sort(),
        chunkSize: config.chunkSize,
        chunkOverlap: config.chunkOverlap
    };

    // 序列化为 JSON 字符串（标准化格式）
    const str = JSON.stringify(normalized, null, 0);

    // 生成哈希值（sha1 更短更合适）
    return createHash('sha1').update(str).digest('hex');
}
