import queueService, { checkRedisConnection } from '@/lib/queue';

export async function GET(request: Request) {
    try {
        const redisConnected = await checkRedisConnection();
        if (!redisConnected) {
            return Response.json('Redis 连接失败，请检查 Redis 服务是否正常启动。', { status: 500 });
        }
        // 创建 Worker 实例
        await queueService.initializeWorker();
        return Response.json('Worker 已启动。', { status: 200 });
    } catch (error) {
        console.error('❌ 初始化 Worker 出错:', error);
        return Response.json('初始化 Worker 出错。', { status: 500 });
    }
}
