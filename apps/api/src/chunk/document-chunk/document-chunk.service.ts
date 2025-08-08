import {Inject, Injectable, Logger} from '@nestjs/common';
import {PrismaService} from '@/common/prisma/prisma.service';
import {QueryDocumentChunkDto} from '@/chunk/document-chunk/dto/query-document-chunk.dto';
import {UpdateDocumentChunkDto} from '@/chunk/document-chunk/dto/update-document-chunk.dto';
import {GenQuestionDto} from '@/chunk/document-chunk/dto/gen-question.dto';
import {ResponseUtil} from '@/utils/response.util';
import {ModelConfigService} from '@/setting/model-config/model-config.service';
import {ProjectService} from '@/project/project.service';
import {doubleCheckModelOutput} from '@/utils/model.util';
import {Chunks, Prisma, Questions} from '@prisma/client';
import {QuestionService} from '@/question/question.service';
import {ContextType} from '@repo/shared-types';
import {ModelConfigWithProvider} from '@/common/prisma/type';
import {AIService} from "@/common/ai/ai.service";
import {getQuestionPrompt} from "@/common/ai/prompts/question";
import {questionsSchema} from "@/common/ai/prompts/schema";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {Cache} from "cache-manager"
import {CreateDocumentChunkDto} from "@/chunk/document-chunk/dto/create-document-chunk.dto";
import {createHash} from "crypto";
import {DocumentService} from "@/knowledge/document/document.service";
import {chunker} from "@/utils/chunker";
import {nanoid} from "nanoid";
import {FileUtil} from "@/utils/file.util";

@Injectable()
export class DocumentChunkService {
    private readonly logger = new Logger(DocumentChunkService.name);

    constructor(private readonly prisma: PrismaService,
                private readonly aiService: AIService,
                private readonly documentService: DocumentService,
                private readonly modelConfigService: ModelConfigService,
                private readonly projectService: ProjectService,
                private readonly questionService: QuestionService,
                @Inject(CACHE_MANAGER) private cacheManager: Cache) {
    }


    async create(createDocumentChunkDto: CreateDocumentChunkDto) {
        const {fileIds, strategy, separators, chunkSize, chunkOverlap, projectId} = createDocumentChunkDto;
        const chunkConfigHash = this.generateChunkConfigHash({fileIds, strategy, separators, chunkSize, chunkOverlap});
        const cachedChunks = await this.cacheManager.get<Chunks[]>(`preview-chunks:${projectId}:${chunkConfigHash}`);
        if (cachedChunks && cachedChunks.length > 0) {
            return {chunkList: cachedChunks, hash: chunkConfigHash}
        }
        const chunkList = await this.genChunkData(createDocumentChunkDto)
        await this.cacheManager.set(`preview-chunks:${projectId}:${chunkConfigHash}`, chunkList, 1000 * 60 * 5);
        return {chunkList, hash: chunkConfigHash}
    }

    async chunkAndSave(createDocumentChunkDto: CreateDocumentChunkDto) {
        const chunkList = await this.genChunkData(createDocumentChunkDto)
        return this.prisma.chunks.createMany({data: chunkList});
    }


    private async genChunkData(createDocumentChunkDto: CreateDocumentChunkDto) {
        const {fileIds, strategy, separators, chunkSize, chunkOverlap, projectId} = createDocumentChunkDto;
        const docs = await this.documentService.getByIds(fileIds);
        //将文件内容进行分块
        let chunkList: Chunks[] = [];
        for (const doc of docs) {
            const filePath = doc.parserFilePath || doc.path;
            if (!filePath) {
                continue;
            }
            const data = await chunker(filePath, strategy, {chunkSize, chunkOverlap, separators});
            data.map((text, index) => {
                chunkList.push({
                    id: nanoid(),
                    projectId,
                    name: FileUtil.generateChunkName(doc.fileName, index + 1),
                    documentId: doc.id,
                    documentName: doc.fileName,
                    content: text.pageContent
                        .split('\n')
                        .filter(line => line.trim().length > 0)
                        .map(line => line.trim())
                        .join('\n'),
                    size: text.pageContent.length
                } as Chunks);
            });
        }
        return chunkList;
    }

    async save(projectId: string, chunkConfigHash: string) {
        // 获取缓存数据
        const cacheKey = `preview-chunks:${projectId}:${chunkConfigHash}`;
        const cachedChunks = await this.cacheManager.get<Chunks[]>(cacheKey);
        if (!cachedChunks || !Array.isArray(cachedChunks)) {
            throw new Error('缓存数据无效或已过期，请重新上传操作');
        }
        try {
            return this.prisma.chunks.createMany({data: cachedChunks});
        } catch (error) {
            console.error('Failed to create chunks in database');
            throw error;
        }
    }

    async getListPagination(queryDto: QueryDocumentChunkDto) {
        try {
            const {projectId, page, pageSize, status, fileIds, query} = queryDto;
            const whereClause: Prisma.ChunksWhereInput = {
                projectId,
            };
            // 处理状态过滤条件
            if (status === 'generated' || status === 'ungenerated') {
                const questions = await this.questionService.getListByContextType(projectId, ContextType.TEXT)
                const questionContextIds = questions.map(q => q.contextId)
                if (status === 'generated') {
                    whereClause.id = {
                        in: questionContextIds
                    };
                } else if (status === 'ungenerated') {
                    whereClause.id = {
                        notIn: questionContextIds
                    };
                }
            }
            if (fileIds && fileIds.length > 0) {
                whereClause.documentId = {in: fileIds};
            }
            if (query) {
                whereClause.OR = [
                    {name: {contains: query}},
                    {content: {contains: query}}
                ];
            }
            const [data, total] = await Promise.all([
                this.prisma.chunks.findMany({
                    where: whereClause,
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                }),
                this.prisma.chunks.count({
                    where: whereClause,
                }),
            ]);
            return {data, total};
        } catch (error) {
            console.error('Failed to get chunks by pagination in database');
            throw error;
        }
    }

    getInfoById(id: string) {
        try {
            return this.prisma.chunks.findUnique({
                where: {id},
                include: {ChunkEntities: true},
            });
        } catch (error) {
            console.error('Failed to get chunks by id in database');
            throw error;
        }
    }

    update(id: string, updateDocumentChunkDto: UpdateDocumentChunkDto) {
        try {
            return this.prisma.chunks.update({
                where: {id},
                data: {
                    name: updateDocumentChunkDto.name,
                    content: updateDocumentChunkDto.content,
                    tags: updateDocumentChunkDto.tags,
                    size: updateDocumentChunkDto.content.length,
                },
            });
        } catch (error) {
            console.error('Failed to update chunks by id in database');
            throw error;
        }
    }

    async removeBatch(ids: string[]) {
        try {
            await this.prisma.$transaction(async tx => {
                await tx.questions.deleteMany({
                    where: {
                        contextId: {in: ids},
                        contextType: ContextType.TEXT,
                    },
                });

                await tx.chunks.deleteMany({where: {id: {in: ids}}});
            });
        } catch (error) {
            console.error('Failed to delete chunks by id in database');
            throw error;
        }
    }

    async genQuestion(genQuestionDto: GenQuestionDto) {
        try {
            const {
                chunkId,
                projectId,
                modelConfigId,
                questionCountType,
                questionCount,
                difficulty,
                audience,
                genre,
                language,
                temperature,
                maxTokens,
            } = genQuestionDto;

            // 并行获取文本块内容和项目配置
            const [chunk, project, model] = await Promise.all([
                this.getInfoById(chunkId),
                this.projectService.getInfoById(projectId),
                this.modelConfigService.getModelConfigById(modelConfigId),
            ]);

            if (!chunk || !project || !model) {
                return ResponseUtil.badRequest('not found');
            }

            // 获取项目 提示词配置 信息
            const {globalPrompt, questionPrompt} = project;

            // 获取问题生成提示词
            const prompt = getQuestionPrompt({
                text: chunk.content,
                tags: chunk.tags || '',
                number: questionCountType === 'custom' ? questionCount : undefined,
                difficulty: difficulty,
                audience: audience,
                genre: genre,
                language: language,
                globalPrompt,
                questionPrompt,
            });
            const data = await this.aiService.chat({
                ...model,
                temperature: temperature,
                maxTokens: maxTokens,
            } as ModelConfigWithProvider, prompt);
            this.logger.log('Model Response:', data);
            const {text} = data;
            this.logger.log('Model Output:', text);
            const modelOutput = await doubleCheckModelOutput(text, questionsSchema);
            this.logger.log('Model Output after double check:', modelOutput);
            const questions = modelOutput.map(question => {
                return {
                    realQuestion: question.question,
                    question: question.question,
                    label: question.label.join(','),
                    projectId,
                    contextId: chunk.id,
                    contextData: chunk.content,
                    contextName: chunk.name,
                    contextType: ContextType.TEXT,
                } as Questions;
            });
            // 保存问题到数据库
            await this.questionService.insertQuestions(questions as Questions[]);
            return questions;
        } catch (error) {
            this.logger.error('Error generating questions:', error);
            throw error;
        }
    }

    async mergeChunks(sourceId: string, targetId: string) {
        try {
            // 获取 source 和 target chunk
            const [sourceChunk, targetChunk] = await Promise.all([
                this.prisma.chunks.findUnique({where: {id: sourceId}}),
                this.prisma.chunks.findUnique({where: {id: targetId}})
            ]);

            if (!sourceChunk || !targetChunk) {
                throw new Error(`One or both chunks not found (source: ${sourceId}, target: ${targetId})`);
            }

            // 确保不是合并到自己
            if (sourceId === targetId) {
                throw new Error('Cannot merge a chunk into itself');
            }

            // 合并内容
            const mergedContent = `${targetChunk.content}\n\n${sourceChunk.content}`;

            const result = await this.prisma.$transaction(async tx => {
                // 更新目标 chunk 内容
                const updatedTarget = await tx.chunks.update({
                    where: {id: targetId},
                    data: {content: mergedContent, size: mergedContent.length}
                });

                await tx.questions.updateMany({where: {contextId: sourceId}, data: {contextId: targetId}});

                // 删除 source chunk
                await tx.chunks.delete({where: {id: sourceId}});

                return {
                    mergedChunk: updatedTarget,
                    deletedChunkId: sourceId
                };
            });

            return result;
        } catch (error) {
            console.error('Failed to merge chunks:', error);
            throw new Error(`Chunk merging failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }


    private generateChunkConfigHash(config: {
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



}
