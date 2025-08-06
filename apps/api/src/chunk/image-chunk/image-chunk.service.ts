import {Injectable} from '@nestjs/common';
import {CreateImageChunkDto} from './dto/create-image-chunk.dto';
import {PrismaService} from "@/common/prisma/prisma.service";
import {readFileSync} from "fs";
import {GenQuestionDto} from "@/chunk/image-chunk/dto/gen-question.dto";
import {ModelConfigService} from '@/setting/model-config/model-config.service';
import {doubleCheckModelOutput} from "@/utils/model.util";
import {z} from "zod";
import {ImagesService} from "@/knowledge/images/images.service";
import {QueryImageChunkDto} from "@/chunk/image-chunk/dto/query-image-chunk.dto";
import {Prisma} from "@prisma/client";
import {AIService} from "@/common/ai/ai.service";
import {genImageQuestionPrompt} from "@/common/ai/prompts/vision";

@Injectable()
export class ImageChunkService {
    constructor(private readonly prisma: PrismaService,
                private readonly modelConfigService: ModelConfigService,
                private readonly aiService: AIService,
                private readonly imagesService: ImagesService) {
    }

    create(createImageChunkDto: CreateImageChunkDto) {
        const {projectId, imageId, annotations} = createImageChunkDto;
        const data = annotations.map(item => {
            return {
                ...item,
                projectId,
                imageId,
                x: Math.floor(item.x),
                y: Math.floor(item.y),
                width: Math.floor(item.width),
                height: Math.floor(item.height)
            };
        });

        return this.prisma.imageBlock.createMany({data});
    }

    async genQuestion(genQuestionDto: GenQuestionDto) {
        const {imageId, modelId, prompt} = genQuestionDto;
        const modelConfig = await this.modelConfigService.getModelConfigById(modelId);
        if (!modelConfig) {
            throw new Error('Model config not found');
        }

        const imageFile = await this.imagesService.getInfoById(imageId, true);
        if (!imageFile) throw new Error('Image file not found');

        const buffer: Buffer = readFileSync(imageFile.url);
        const {text} = await this.aiService.vision(modelConfig, buffer, genImageQuestionPrompt(prompt, JSON.stringify(imageFile.ImageBlock)));
        return await doubleCheckModelOutput(text, z.array(z.string()));
    }

    async getListPagination(queryDto: QueryImageChunkDto) {
        try {
            const whereClause: Prisma.ImageBlockWhereInput = {
                projectId: queryDto.projectId
            };
            if (queryDto.label) {
                whereClause.label = {contains: queryDto.label};
            }
            const [data, total] = await Promise.all([
                this.prisma.imageBlock.findMany({
                    where: whereClause,
                    include: {
                        image: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip: (queryDto.page - 1) * queryDto.pageSize,
                    take: queryDto.pageSize
                }),
                this.prisma.imageBlock.count({
                    where: whereClause
                })
            ]);
            return {data, total};
        } catch (error) {
            console.error('Failed to get imageBlock by pagination in database');
            throw error;
        }
    }

    async getListByImageId(imageId: string) {
        return this.prisma.imageBlock.findMany({where: {imageId}});
    }

    async deleteByImageId(imageId: string) {
        try {
            await this.prisma.imageBlock.deleteMany({where: {imageId}});
        } catch (error) {
            console.error('Failed to delete imageFile by ImageId in database');
            throw error;
        }
    }

    async removeBatch(ids: string[]) {
        try {
            await this.prisma.imageBlock.deleteMany({where: {id: {in: ids}}});
        } catch (error) {
            console.error('Failed to delete imageFile by id in database');
            throw error;
        }
    }
}
