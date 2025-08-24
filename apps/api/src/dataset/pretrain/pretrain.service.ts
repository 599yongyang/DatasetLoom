import { Inject, Injectable } from '@nestjs/common';
import { Chunks, Prisma } from '@prisma/client';
import { ResponseUtil } from '@/utils/response.util';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { QueryPretrainDto } from '@/dataset/pretrain/dto/query-pretrain.dto';
import { customAlphabet } from 'nanoid';
import { join } from 'path';
import { tmpdir } from 'os';
import { createWriteStream } from 'fs';
import * as archiver from 'archiver';
import { ExportUtil } from '@/utils/export.util';
import fs from 'fs/promises';
import { PassThrough } from 'node:stream';

@Injectable()
export class PretrainService {
    constructor(private readonly prisma: PrismaService, @Inject(CACHE_MANAGER) private cacheManager: Cache) {
    }

    async save(projectId: string, chunkConfigHash: string) {
        // 获取缓存数据
        const cacheKey = `preview-chunks:${projectId}:${chunkConfigHash}`;
        const cachedChunks = await this.cacheManager.get<Chunks[]>(cacheKey);

        if (!cachedChunks || !Array.isArray(cachedChunks)) {
            throw new Error('缓存数据无效或已过期，请重新上传操作');
        }

        try {
            const uppercaseId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
            const data = cachedChunks.map(chunk => {
                return {
                    id: uppercaseId(),
                    projectId,
                    documentId: chunk.documentId,
                    content: chunk.content
                };
            });
            const batchSize = 1000;
            for (let i = 0; i < data.length; i += batchSize) {
                const batch = data.slice(i, i + batchSize);
                await this.prisma.pretrainData.createMany({ data: batch });
            }
            // 清除缓存
            await this.cacheManager.del(cacheKey);
        } catch (error) {
            throw ResponseUtil.badRequest(`保存chunks失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async getListPagination(queryDto: QueryPretrainDto) {
        try {
            const { projectId, page, pageSize, query } = queryDto;
            const whereClause: Prisma.PretrainDataWhereInput = {
                projectId,
                content: query ? { contains: query } : undefined
            };


            const [data, total] = await Promise.all([
                this.prisma.pretrainData.findMany({
                    where: whereClause,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        document: {
                            select: {
                                fileName: true
                            }
                        }
                    },
                    skip: (page - 1) * pageSize,
                    take: pageSize
                }),
                this.prisma.pretrainData.count({
                    where: whereClause
                })
            ]);
            return { data, total };
        } catch (error) {
            console.error('Failed to get chunks by pagination in database');
            throw error;
        }
    }

    async removeBatch(ids: string[]) {
        try {
            await this.prisma.pretrainData.deleteMany({ where: { id: { in: ids } } });
        } catch (error) {
            console.error('Failed to delete chunks by id in database');
            throw error;
        }
    }

    async exportPretrainDataset(projectId: string) {
        const filename = `DatasetLoom-${projectId}-pretrain.zip`;
        const zipPath = join(tmpdir(), filename);

        const output = createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(output);

        try {
            // 创建数据集文件写入流
            const datasetFilename = `pretrain_dataset.json`;
            const datasetStream = new PassThrough();
            archive.append(datasetStream, { name: datasetFilename });

            // 开始写入JSON数组
            datasetStream.write('[\n');

            let firstRecord = true;
            const batchSize = 1000;
            let skip = 0;

            // 分批查询并写入
            while (true) {
                const batch = await this.prisma.pretrainData.findMany({
                    where: { projectId },
                    select: { content: true },
                    skip,
                    take: batchSize
                });

                if (batch.length === 0) break;

                for (const record of batch) {
                    if (!firstRecord) {
                        datasetStream.write(',\n');
                    }
                    datasetStream.write(JSON.stringify({ text: record.content }));
                    firstRecord = false;
                }

                skip += batchSize;

                // 释放事件循环，避免阻塞
                if (skip % 5000 === 0) {
                    await new Promise(resolve => setImmediate(resolve));
                }
            }

            // 结束JSON数组
            datasetStream.write('\n]');
            datasetStream.end();

            // 添加数据集信息文件
            const datasetInfo = {
                DatasetLoom: {
                    file_name: datasetFilename,
                    columns: {
                        prompt: 'text'
                    }
                }
            };

            await ExportUtil.addJsonToArchive(archive, 'dataset_info.json', datasetInfo);

            await archive.finalize();
            return { filePath: zipPath, filename };
        } catch (error) {
            await fs.unlink(zipPath).catch(() => null);
            throw error;
        }
    }

}
