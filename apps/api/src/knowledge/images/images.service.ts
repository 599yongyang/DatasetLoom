import {Injectable} from '@nestjs/common';
import {ImageFile} from '@prisma/client';
import {promises as fs} from 'fs';
import {FileUtil} from '@/utils/file.util';
import {PrismaService} from '@/common/prisma/prisma.service';
import sizeOf from 'image-size';
import {QueryImageDto} from '@/knowledge/images/dto/query-image.dto';
import {ContextType} from '@/common/prisma/enum';
import {ModelConfigWithProvider} from "@/common/prisma/type";
import {doubleCheckModelOutput} from "@/utils/model.util";
import {AIService} from "@/common/ai/ai.service";
import {IMAGE_ANALYSIS_PROMPT} from "@/common/ai/prompts/vision";
import {ImageRecognitionResultSchema} from "@/common/ai/prompts/schema";

@Injectable()
export class ImagesService {

    constructor(private readonly prisma: PrismaService, private readonly aiService: AIService) {
    }

    async getListPagination(queryDto: QueryImageDto) {
        try {
            const {page, pageSize, projectId, fileName} = queryDto;
            const whereClause: any = {
                projectId,
            };
            if (fileName) {
                whereClause.fileName = {contains: fileName};
            }
            const [data, total] = await Promise.all([
                this.prisma.imageFile.findMany({
                    where: whereClause,
                    include: {
                        ImageBlock: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                }),
                this.prisma.imageFile.count({
                    where: whereClause,
                }),
            ]);
            return {data, total};
        } catch (error) {
            console.error('Failed to get imageFile by pagination in database');
            throw error;
        }
    }

    async saveImageFile(modelConfig: ModelConfigWithProvider, projectId: string, files: Array<Express.Multer.File>) {
        // 确保上传目录存在
        await FileUtil.ensureImageDirectory();
        // 处理文件保存
        const savedFiles: ImageFile[] = [];
        for (const file of files) {
            // 验证文件
            FileUtil.validateImageFile(file);

            // 生成唯一文件名
            const fileName = FileUtil.generateUniqueFileName(file.originalname);
            const filePath = FileUtil.getImagePath(fileName);
            // 保存文件
            await fs.writeFile(filePath, file.buffer);
            // 获取图片宽高
            const image = sizeOf(file.buffer);

            let fileInfo = await this.prisma.imageFile.create({
                data: {
                    projectId,
                    fileName: file.originalname,
                    width: image.width,
                    height: image.height,
                    size: file.buffer.length,
                    url: filePath,
                } as ImageFile,
            });
            setTimeout(() => {
                this.processImageAnalysis(fileInfo.id, modelConfig, file.buffer);
            }, 0);
            savedFiles.push(fileInfo);
        }
        return savedFiles;
    }

    async processImageAnalysis(id: string, modelConfig: ModelConfigWithProvider, fileBuffer: Buffer) {
        try {
            const {text} = await this.aiService.vision(modelConfig, fileBuffer, IMAGE_ANALYSIS_PROMPT)
            const modelOutput = await doubleCheckModelOutput(text, ImageRecognitionResultSchema);
            await this.update(id, {
                tags: modelOutput.entities ? modelOutput.entities.join(',') : '',
                ocrText: modelOutput.text || '',
                status: 'DONE'
            } as ImageFile);
        } catch (error) {
            console.error('Error during image analysis:', error);
        }
    };

    async removeBatch(ids: string[]) {
        try {
            await this.prisma.$transaction(async tx => {
                await tx.questions.deleteMany({
                    where: {
                        contextId: {in: ids},
                        contextType: ContextType.IMAGE,
                    },
                });

                await tx.imageFile.deleteMany({
                    where: {id: {in: ids}},
                });
            });
        } catch (error) {
            console.error('Failed to delete imageFile by id in database');
            throw error;
        }
    }

    update(id: string, data: ImageFile) {
        try {
            return this.prisma.imageFile.update({where: {id}, data});
        } catch (error) {
            console.error('Failed to update imageFile by id in database');
            throw error;
        }
    }

    getInfoById(id: string, includeChunk: boolean = false) {
        try {
            return this.prisma.imageFile.findUnique({
                where: {id},
                include: {ImageBlock: includeChunk}
            });
        } catch (error) {
            console.error('Failed to get imageFile by id in database');
            throw error;
        }
    }

    getImageFileUrl(contextId: string) {
        return this.prisma.imageFile.findUnique({
            where: {id: contextId},
            select: {url: true},
        });
    }
}
