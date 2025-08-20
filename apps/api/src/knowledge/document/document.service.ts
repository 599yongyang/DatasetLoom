import { HttpStatus, Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { PrismaService } from '@/common/prisma/prisma.service';
import { QueryDocumentDto } from '@/knowledge/document/dto/query-document.dto';
import { FileUtil } from '@/utils/file.util';
import { Parser } from '@/utils/parser/types';
import { RagService } from '@/common/rag/rag.service';
import { ResponseUtil } from '@/utils/response.util';
import { ModelConfigWithProvider } from '@/common/prisma/type';

@Injectable()
export class DocumentService {
    constructor(private readonly prisma: PrismaService, private readonly ragService: RagService) {
    }


    async saveDocumentByLocalFile(projectId: string, files: Array<Express.Multer.File>, parser: Parser) {
        // 确保上传目录存在
        await FileUtil.ensureDocumentDirectory();
        // 处理文件保存
        const savedFileIds: string[] = [];
        for (const file of files) {
            // 验证文件
            FileUtil.validateDocumentFile(file);
            const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
            // 生成唯一文件名
            const fileName = FileUtil.generateUniqueFileName(originalName);
            const filePath = FileUtil.getDocumentPath(fileName);
            const fileExt = originalName.split('.').pop()?.toLowerCase();
            // 保存文件
            await fs.writeFile(filePath, file.buffer);


            let parserFilePath = '';
            let parserFileExt = '';
            let parserFileSize = 0;

            const parseResult = await parser.parse({
                filePath: filePath,
                fileName: originalName,
                pdf: file.buffer.toString('base64')
            });

            const parsedFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.md`;
            parserFilePath = FileUtil.getDocumentPath(parsedFileName);
            await fs.writeFile(parserFilePath, parseResult);

            const stats = await fs.stat(parserFilePath);
            parserFileExt = '.md';
            parserFileSize = stats.size;

            // 保存文件记录到数据库
            const document = await this.prisma.documents.create({
                data: {
                    projectId,
                    fileName: originalName,
                    size: file.buffer.length,
                    md5: '',
                    fileExt,
                    path: filePath,
                    sourceType: 'local',
                    parserFilePath,
                    parserFileExt,
                    parserFileSize
                }
            });
            savedFileIds.push(document.id);
        }
        return savedFileIds;
    }

    async saveDocumentByWebUrl(projectId: string, webUrls: string[], parser: Parser) {
        const savedFileIds: string[] = [];
        for (const url of webUrls) {
            try {
                const result = await parser.parse({ url });
                const parsedFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.md`;
                const parserFilePath = FileUtil.getDocumentPath(parsedFileName);
                await fs.writeFile(parserFilePath, result);

                const stats = await fs.stat(parserFilePath);

                const document = await this.prisma.documents.create({
                    data: {
                        projectId,
                        fileName: url,
                        sourceType: 'webUrl',
                        parserFilePath,
                        parserFileExt: '.md',
                        parserFileSize: stats.size
                    }
                });
                savedFileIds.push(document.id);
            } catch (error) {
                console.error(`URL 解析失败: ${url}`, error);
                throw error;
            }
        }
        return savedFileIds;
    }

    async getListPagination(queryDto: QueryDocumentDto) {
        try {
            const whereClause: any = {
                projectId: queryDto.projectId
            };
            if (queryDto.fileExt) {
                whereClause.fileExt = { contains: queryDto.fileExt };
            }
            if (queryDto.fileName) {
                whereClause.fileName = { contains: queryDto.fileName };
            }
            const [data, total] = await Promise.all([
                this.prisma.documents.findMany({
                    where: whereClause,
                    include: {
                        _count: {
                            select: {
                                Chunks: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip: (queryDto.page - 1) * queryDto.pageSize,
                    take: queryDto.pageSize
                }),
                this.prisma.documents.count({
                    where: whereClause
                })
            ]);
            return { data, total };
        } catch (error) {
            console.error('Failed to get Documents by pagination in database');
            throw error;
        }
    }

    getByIds(fileId: string[]) {
        try {
            return this.prisma.documents.findMany({ where: { id: { in: fileId } } });
        } catch (error) {
            console.error('Failed to get Documents by id in database');
            throw error;
        }
    }

    removeBatch(ids: string[]) {
        try {
            return this.prisma.documents.deleteMany({ where: { id: { in: ids } } });
        } catch (error) {
            console.error('Failed to delete Documents by id in database');
            throw error;
        }
    }

    async vector(modelConfig: ModelConfigWithProvider, id: string) {
        try {
            const chunks = await this.prisma.chunks.findMany({ where: { documentId: id } });
            if (modelConfig && chunks.length > 0) {
                await this.ragService.insertVectorData(modelConfig, chunks);
                await this.prisma.documents.update({
                    data: { embedModelName: modelConfig.modelId },
                    where: { id: id }
                });
            }
        } catch (error) {
            console.error('Failed to generate embeddings by document id');
            throw ResponseUtil.error(`向量数据生成失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }


}
