import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    Header,
    StreamableFile,
    ParseArrayPipe
} from '@nestjs/common';
import { QaDatasetService } from './qa-dataset.service';
import { CreateQaDatasetDto } from './dto/create-qa-dataset.dto';
import { UpdateQaDatasetDto } from './dto/update-qa-dataset.dto';
import { ResponseUtil } from '@/utils/response.util';
import { QueryQaDatasetDto } from '@/dataset/qa/dto/query-qa-dataset.dto';
import { QuestionService } from '@/question/question.service';
import { DatasetSamples } from '@prisma/client';
import { ExportQaDatasetDto } from '@/dataset/qa/dto/export-qa-dataset.dto';
import { ExportDatasetService } from '@/dataset/qa/export-dataset.service';
import { createReadStream } from 'node:fs';
import { PreferencePairDto } from '@/dataset/qa/dto/preference-pair.dto';
import { ContextType, ModelConfigType, ProjectRole } from '@repo/shared-types';
import { ModelConfigService } from '@/setting/model-config/model-config.service';
import { Permission } from '@/auth/decorators/permission.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('QA 数据集')
@Controller(':projectId/qa-dataset')
export class QADatasetController {
    constructor(private readonly qaService: QaDatasetService,
                private readonly questionService: QuestionService,
                private readonly exportDatasetService: ExportDatasetService,
                private readonly modelConfigService: ModelConfigService) {
    }

    @Post('create')
    @ApiOperation({ summary: '创建数据集' })
    @Permission(ProjectRole.EDITOR)
    async create(@Param('projectId') projectId: string, @Body() createQaDto: CreateQaDatasetDto) {
        createQaDto.projectId = projectId;
        const question = await this.questionService.getInfoById(createQaDto.questionId);
        if (!question) {
            return ResponseUtil.notFound('Question not found');
        }
        const model = await this.modelConfigService.getModelConfigById(createQaDto.modelConfigId);
        if (!model) {
            return ResponseUtil.notFound('Model Config not found');
        }
        const contextTypeSupported =
            (question.contextType === ContextType.TEXT && model.type.includes(ModelConfigType.TEXT)) ||
            (question.contextType === ContextType.IMAGE && model.type.includes(ModelConfigType.VISION));

        if (!contextTypeSupported) {
            return ResponseUtil.badRequest('Model does not support the question context type');
        }
        const datasetSample = await this.qaService.createDatasetSample(question, model, createQaDto);
        return ResponseUtil.success(datasetSample);
    }

    @Get()
    @ApiOperation({ summary: '获取QA数据集' })
    @Permission(ProjectRole.VIEWER)
    async getList(@Query() queryDto: QueryQaDatasetDto) {
        const data = await this.qaService.getListPagination(queryDto);
        return ResponseUtil.success(data);
    }

    @Get(':id')
    @ApiOperation({ summary: '获取QA数据集详情' })
    @Permission(ProjectRole.VIEWER)
    async getInfo(@Param('projectId') projectId: string, @Param('id') id: string) {
        const { total, confirmedCount } = await this.questionService.getQuestionsCount(projectId);
        // 获取问题以及数据集
        const data = await this.questionService.getQuestionWithDatasetById(id);
        return ResponseUtil.success({ data, total, confirmedCount });
    }


    @Get('navigation/:id')
    @ApiOperation({ summary: '数据集翻页' })
    @Permission(ProjectRole.VIEWER)
    async getNavigation(@Param('projectId') projectId: string, @Param('id') id: string, @Query('operateType') operateType?: 'prev' | 'next') {
        const { total, confirmedCount } = await this.questionService.getQuestionsCount(projectId);
        if (operateType !== null && (operateType === 'prev' || operateType === 'next')) {
            const data = await this.questionService.getNavigationItems(projectId, id, operateType);
            return ResponseUtil.success({ data, total, confirmedCount });
        } else {
            return ResponseUtil.error('Invalid operateType');
        }
    }

    @Post('ai-score')
    @ApiOperation({ summary: '创建AI评分' })
    @Permission(ProjectRole.EDITOR)
    async genAiScore(@Body() body: { dssId: string, modelId: string }) {
        const dss = await this.qaService.getInfoById(body.dssId);
        if (!dss) {
            return ResponseUtil.notFound('The dataset sample does not exist');
        }
        const model = await this.modelConfigService.getModelConfigById(body.modelId);
        if (!model) {
            return ResponseUtil.notFound('The model does not exist');
        }
        const datasetSample = await this.qaService.createEval(dss, model);
        return ResponseUtil.success(datasetSample);
    }

    @Get('ai-score')
    @Permission(ProjectRole.VIEWER)
    @ApiOperation({ summary: '获取AI评分' })
    async getAiScore(@Query('sampleId') sampleId: string, @Query('sampleType') sampleType: string) {
        const datasetSample = await this.qaService.getEvalList(sampleId, sampleType);
        return ResponseUtil.success(datasetSample);
    }

    @Patch(':id')
    @ApiOperation({ summary: '更新数据集样本' })
    @Permission(ProjectRole.EDITOR)
    async update(@Param('id') id: string, @Body() updateQaDto: UpdateQaDatasetDto) {
        await this.qaService.update({ id, ...updateQaDto } as DatasetSamples);
        return ResponseUtil.success();
    }

    @Patch('primary-answer/:id')
    @ApiOperation({ summary: '更新数据集样本的主答案' })
    @Permission(ProjectRole.EDITOR)
    async primaryAnswer(@Param('id') id: string) {
        const data = await this.qaService.getInfoById(id);
        if (!data) {
            return ResponseUtil.notFound('Dataset sample not found');
        }
        await this.qaService.updatePrimaryAnswer(id, data.questionId);
        return ResponseUtil.success();
    }

    @Post('preference-pair')
    @ApiOperation({ summary: '设置数据集偏好' })
    @Permission(ProjectRole.EDITOR)
    async preferencePair(@Param('projectId') projectId: string, @Body() pairDto: PreferencePairDto) {
        pairDto.projectId = projectId;
        const datasetSample = await this.qaService.savePreferencePair(pairDto);
        return ResponseUtil.success(datasetSample);
    }


    @Delete('delete')
    @ApiOperation({ summary: '删除数据集' })
    @Permission(ProjectRole.ADMIN)
    async removeBatch(@Query('ids', new ParseArrayPipe({ items: String, separator: ',' })) ids: string[]) {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return ResponseUtil.badRequest('IDs array is required and cannot be empty');
        }
        const deletedCount = await this.qaService.removeBatch(ids);
        return ResponseUtil.success(null, `${deletedCount} document-chunk(s) deleted successfully`);
    }


    @Post('export')
    @ApiOperation({ summary: '导出数据集' })
    @Permission(ProjectRole.EDITOR)
    @Header('Content-Type', 'application/zip')
    @Header('Access-Control-Expose-Headers', 'Content-Disposition')
    async export(@Param('projectId') projectId: string, @Body() exportDto: ExportQaDatasetDto): Promise<StreamableFile | any> {
        try {
            const { exportType } = exportDto;

            if (exportType === 'HF') {
                const dataset = await this.exportDatasetService.getExportDataset(projectId, exportDto);
                return ResponseUtil.success(dataset);
            }

            const result = await this.exportDatasetService.exportDataset(projectId, exportDto);

            if (result.filePath) {
                const file = createReadStream(result.filePath);
                // 设置文件名
                return new StreamableFile(file, {
                    type: 'application/zip',
                    disposition: `attachment; filename=${result.filename}`
                });
            }

            return ResponseUtil.success(result);
        } catch (error) {
            console.error('获取数据集失败:', error);
            return ResponseUtil.error('获取数据集失败', error);
        }
    }
}
