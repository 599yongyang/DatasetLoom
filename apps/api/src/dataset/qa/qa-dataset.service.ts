import {Injectable} from '@nestjs/common';
import {QueryQaDatasetDto} from '@/dataset/qa/dto/query-qa-dataset.dto';
import {DatasetSamples, Prisma, Questions} from '@prisma/client';
import {PrismaService} from '@/common/prisma/prisma.service';
import {ResponseUtil} from "@/utils/response.util";
import {ContextType, EvalSourceType} from "@repo/shared-types";
import {QuestionService} from "@/question/question.service";
import {TextDatasetGenerator} from "@/dataset/qa/generators/text-dataset.generator";
import {DatasetSampleWithQuestion, ModelConfigWithProvider, QuestionsWithDatasetSample} from "@/common/prisma/type";
import {PreferencePairDto} from "@/dataset/qa/dto/preference-pair.dto";
import {EvaluationGenerator} from "@/dataset/qa/generators/evaluation.generator";
import { ImageDatasetGenerator } from '@/dataset/qa/generators/image-dataset.generator';
import { AiGenDto } from '@/common/dto/ai-gen.dto';

@Injectable()
export class QaDatasetService {

    constructor(private readonly prisma: PrismaService,
                private readonly questionService: QuestionService,
                private readonly textDatasetGenerator: TextDatasetGenerator,
                private readonly imageDatasetGenerator: ImageDatasetGenerator,
                private readonly evaluationGenerator: EvaluationGenerator) {
    }

    async createDatasetSample(question: QuestionsWithDatasetSample, model: ModelConfigWithProvider, createQaDto: AiGenDto) {
        try {

            let datasetSamples: Partial<DatasetSamples>;
            if (question.contextType === ContextType.TEXT) {
                datasetSamples = await this.textDatasetGenerator.generate(createQaDto, model, question);
            } else if (question.contextType === ContextType.IMAGE) {
                datasetSamples = await this.imageDatasetGenerator.generate(createQaDto, model, question);
            } else {
                return ResponseUtil.badRequest('Unsupported context type');
            }

            const datasetSample = await this.prisma.datasetSamples.create({
                data: datasetSamples as DatasetSamples,
            });
            await this.questionService.update(createQaDto.itemId, {answered: true} as Questions);
            return datasetSample;

        } catch (error) {
            console.error('Failed to save datasets in database');
            throw error;
        }
    }

    updatePrimaryAnswer(id: string, questionId: string) {
        try {
            return this.prisma.$transaction([
                this.prisma.datasetSamples.updateMany({
                    where: {questionId},
                    data: {
                        isPrimaryAnswer: false,
                    },
                }),
                this.prisma.datasetSamples.update({
                    where: {id, questionId},
                    data: {
                        isPrimaryAnswer: true,
                    },
                }),
            ]);
        } catch (error) {
            console.error('Failed to update primary answer in database');
            throw new Error('Failed to set primary answer');
        }
    }

    async getListPagination(queryDto: QueryQaDatasetDto) {
        const {
            projectId,
            page = 1,
            pageSize = 10,
            query = '',
            showType,
            contextType,
            confirmed,
        } = queryDto;

        try {
            let result: {
                data: any[];
                total: number;
            };

            if (showType === 'dpo') {
                const where: Prisma.PreferencePairWhereInput = {
                    projectId,
                    prompt: {contains: query},
                    question: {
                        ...(contextType && {contextType}),
                        ...(confirmed !== undefined && {confirmed: confirmed === 'confirmed'}),
                    },
                };

                const [data, total] = await Promise.all([
                    this.prisma.preferencePair.findMany({
                        where,
                        orderBy: {createdAt: 'desc'},
                        skip: (page - 1) * pageSize,
                        take: pageSize,
                    }),
                    this.prisma.preferencePair.count({where}),
                ]);

                result = {data, total};
                console.log('result', result)
            } else {
                const where: Prisma.DatasetSamplesWhereInput = {
                    projectId,
                    question: {contains: query},
                    questions: {
                        ...(contextType && {contextType}),
                        ...(confirmed !== undefined && {confirmed: confirmed === 'confirmed'}),
                    },
                    ...(showType === 'sft' && {isPrimaryAnswer: true}),
                };

                const [data, total] = await Promise.all([
                    this.prisma.datasetSamples.findMany({
                        where,
                        orderBy: {createdAt: 'desc'},
                        skip: (page - 1) * pageSize,
                        take: pageSize,
                    }),
                    this.prisma.datasetSamples.count({where}),
                ]);

                result = {data, total};
            }

            const {total} = result;
            return {
                data: result.data,
                total,
                currentPage: page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };
        } catch (error) {
            throw new Error(`Failed to fetch dataset: ${error.message}`);
        }
    }

    getInfoById(id: string) {
        try {
            return this.prisma.datasetSamples.findUnique({
                where: {id},
                include: {
                    questions: {select: {contextType: true, contextData: true, realQuestion: true, contextId: true}},
                },
            });
        } catch (error) {
            console.error('Failed to get datasets by id in database');
            throw error;
        }
    }


    update(data: DatasetSamples) {
        try {
            return this.prisma.datasetSamples.update({
                data,
                where: {
                    id: data.id,
                },
            });
        } catch (error) {
            console.error('Failed to update datasets in database');
            throw error;
        }
    }

    async removeBatch(ids: string[]) {
        try {
            return await this.prisma.datasetSamples.deleteMany({
                where: {id: {in: ids}},
            });
        } catch (error) {
            console.error('Failed to delete datasets in database');
            throw error;
        }
    }

    async createEval(dss: DatasetSampleWithQuestion, modelConfig: ModelConfigWithProvider) {
        try {
            // 使用抽离的生成器获取AI评分
            const modelOutput = await this.evaluationGenerator.generateAIScore(dss, modelConfig);

            // 保存评估结果
            return await this.prisma.datasetEvaluation.create({
                data: {
                    sampleId: dss.id,
                    sampleType: dss.questions.contextType,
                    model: modelConfig.modelName,
                    type: EvalSourceType.AI,
                    factualAccuracyScore: modelOutput.scores.factualAccuracy,
                    logicalIntegrityScore: modelOutput.scores.logicalIntegrity,
                    expressionQualityScore: modelOutput.scores.expressionQuality,
                    safetyComplianceScore: modelOutput.scores.safetyCompliance,
                    compositeScore: modelOutput.scores.compositeScore,
                    factualInfo: modelOutput.diagnostics.factualInfo ?? '',
                    logicalInfo: modelOutput.diagnostics.logicalInfo ?? '',
                    expressionInfo: modelOutput.diagnostics.expressionInfo ?? '',
                    safetyInfo: modelOutput.diagnostics.safetyInfo ?? '',
                    compositeInfo: modelOutput.diagnostics.compositeInfo ?? ''
                }
            });
        } catch (error) {
            console.error('Failed to create evaluation:', error);
            throw new Error(`Failed to create evaluation: ${error.message}`);
        }
    }


    getEvalList(sampleId: string, sampleType: string) {
        try {
            return this.prisma.datasetEvaluation.findMany({
                where: {sampleId, sampleType}
            });
        } catch (error) {
            console.error('Failed to get datasets by id in database');
            throw error;
        }
    }

    async savePreferencePair(pairDto: PreferencePairDto) {
        try {
            const check = await this.prisma.preferencePair.findFirst({
                where: {
                    projectId: pairDto.projectId,
                    questionId: pairDto.questionId
                }
            });
            if (check) {
                return await this.prisma.preferencePair.update({
                    data: pairDto,
                    where: {
                        id: pairDto.id
                    }
                });
            } else {
                return await this.prisma.preferencePair.create({data: pairDto});
            }
        } catch (error) {
            console.error('Failed to save PreferencePair in database');
            throw error;
        }

    }

}
