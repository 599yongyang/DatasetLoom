import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QueryQuestionDto } from '@/question/dto/query-question.dto';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma, Questions } from '@prisma/client';
import { ContextType } from '@repo/shared-types';


@Injectable()
export class QuestionService {


    constructor(private readonly prisma: PrismaService) {
    }

    async create(createQuestionDto: CreateQuestionDto) {
        const { projectId, questions, contextId, contextName, contextType } = createQuestionDto;
        const questionList: Questions[] = await Promise.all(
            questions.map(async item => {
                const question: Partial<Questions> = {
                    projectId,
                    question: item,
                    contextType,
                    contextId,
                    contextName
                };

                if (contextType === ContextType.IMAGE) {
                    console.log('imageUrl', item);
                    const { realQuestion, regions } = await this.replaceMentionsWithCoordinates(item);
                    question.realQuestion = realQuestion;
                    const image = await this.prisma.imageFile.findUnique({
                        where: {
                            id: contextId
                        }
                    });
                    question.contextData = JSON.stringify({ regions, imageUrl: image ? image.url : '' });
                }
                return question as Questions;
            })
        );

        // 保存
        return await this.insertQuestions(questionList);
    }


    async insertQuestions(questions: Questions[]) {
        try {
            return await this.prisma.questions.createMany({ data: questions });
        } catch (error) {
            console.error('Failed to create questions in database');
            throw error;
        }
    }

    async getListPagination(queryDto: QueryQuestionDto) {
        try {
            const { projectId, page, pageSize, query, answered, contextType } = queryDto;
            const whereClause: Prisma.QuestionsWhereInput = {
                projectId,
                ...(query && {
                    OR: [
                        { question: { contains: query } },
                        { label: { contains: query } }
                    ]
                }),
                ...(answered !== undefined && { answered }),
                ...(contextType && { contextType })
            };

            const [data, total] = await Promise.all([
                this.prisma.questions.findMany({
                    where: whereClause,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        DatasetSamples: true
                    },
                    skip: (page - 1) * pageSize,
                    take: pageSize
                }),
                this.prisma.questions.count({
                    where: whereClause
                })
            ]);

            return { data, total };
        } catch (error) {
            console.error('Failed to get questions by projectId in database');
            throw error;
        }
    }

    getInfoById(id: string) {
        try {
            return this.prisma.questions.findUnique({
                where: { id },
                include: {
                    DatasetSamples: true
                }
            });
        } catch (error) {
            console.error('Failed to get questions by name in database');
            throw error;
        }
    }

    getListByContextType(projectId: string, contextType: ContextType) {
        try {
            return this.prisma.questions.findMany({
                where: {
                    contextType,
                    projectId
                },
                select: {
                    // question: true,
                    contextId: true
                }
            });
        } catch (error) {
            console.error('Failed to get questions by name in database');
            throw error;
        }
    }

    update(id: string, question: Questions) {
        try {
            return this.prisma.questions.update({
                where: { id },
                data: question
            });
        } catch (error) {
            console.error('Failed to update questions in database');
            throw error;
        }
    }

    async removeBatch(ids: string[]) {
        try {
            return this.prisma.questions.deleteMany({
                where: {
                    id: {
                        in: ids
                    }
                }
            });
        } catch (error) {
            console.error('Failed to delete batch questions in database');
            throw error;
        }
    }

    async getQuestionsCount(projectId: string) {
        try {
            // 获取总数：有 DatasetSamples 的问题
            const total = await this.prisma.questions.count({
                where: {
                    projectId,
                    DatasetSamples: { some: {} }
                }
            });

            // 获取已确认的数量
            const confirmedCount = await this.prisma.questions.count({
                where: {
                    projectId,
                    confirmed: true,
                    DatasetSamples: { some: {} }
                }
            });

            return { total, confirmedCount };
        } catch (error) {
            console.error('Failed to get questions count in database', error);
            throw error;
        }
    }

    async getNavigationItems(projectId: string, questionId: string, operateType: 'prev' | 'next') {
        const currentItem = await this.prisma.questions.findUnique({
            where: { id: questionId },
            select: { id: true, createdAt: true }
        });

        if (!currentItem) {
            throw new Error('当前记录不存在');
        }

        const { createdAt, id } = currentItem;

        if (operateType === 'next') {
            return this.prisma.questions.findFirst({
                where: {
                    projectId,
                    DatasetSamples: { some: {} },
                    OR: [{ createdAt: { gt: createdAt } }, { createdAt: createdAt, id: { gt: id } }]
                },
                include: { DatasetSamples: true, PreferencePair: true },
                orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
            });
        } else {
            return this.prisma.questions.findFirst({
                where: {
                    projectId,
                    DatasetSamples: { some: {} },
                    OR: [{ createdAt: { lt: createdAt } }, { createdAt: createdAt, id: { lt: id } }]
                },
                include: { DatasetSamples: true, PreferencePair: true },
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
            });
        }
    }

    async getQuestionWithDatasetById(id: string) {
        try {
            return await this.prisma.questions.findUnique({
                where: { id },
                include: {
                    DatasetSamples: true,
                    PreferencePair: true
                }
            });
        } catch (error) {
            console.error('Failed to get questions by name in database');
            throw error;
        }
    }

    /**
     * 替换文本中的标注引用为坐标，并提取区域信息
     * @param text 包含标注的原始文本，如"这个区域@[标注A](123)和@[标注B](456)的关系是什么？"
     * @returns 包含处理后的问题和区域信息的对象
     */
    private async replaceMentionsWithCoordinates(text: string) {
        const regex = /@\[([^\]]+)\]\(([^)]+)\)/g;
        const matches = [...text.matchAll(regex)];

        const regions: any[] = [];
        let replacedText = text;
        for (const match of matches) {
            const [fullMatch, label, blockId] = match;
            if (!blockId) continue;

            // 获取坐标信息
            const coord = await this.prisma.imageBlock.findUnique({
                where: { id: blockId },
                select: { x: true, y: true, width: true, height: true, label: true }
            });
            if (!coord) continue;
            // 替换文本中的标注
            replacedText = replacedText.replace(fullMatch, `[x:${coord.x} y:${coord.y} w:${coord.width} h:${coord.height}]`);
            // 收集区域信息
            regions.push({
                ...coord,
                id: blockId
            });
        }

        return {
            realQuestion: replacedText,
            regions
        };
    }

}
