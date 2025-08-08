import { Controller, Get, Body, Param, Delete, Query, Put, Post, ParseArrayPipe, Patch } from '@nestjs/common';
import { DocumentChunkService } from './document-chunk.service';
import { UpdateDocumentChunkDto } from './dto/update-document-chunk.dto';
import { ResponseUtil } from '@/utils/response.util';
import { QueryDocumentChunkDto } from '@/chunk/document-chunk/dto/query-document-chunk.dto';
import { GenQuestionDto } from '@/chunk/document-chunk/dto/gen-question.dto';
import { CreateDocumentChunkDto } from '@/chunk/document-chunk/dto/create-document-chunk.dto';
import { GenTagRelDto } from '@/chunk/document-chunk/dto/gen-tag-rel.dto';
import { ModelConfigService } from '@/setting/model-config/model-config.service';
import { ProjectService } from '@/project/project.service';
import { TagRelGenerator } from '@/chunk/document-chunk/generators/tag-rel.generator';
import { Permission } from '@/auth/decorators/permission.decorator';
import { ProjectRole } from '@repo/shared-types';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('文档分块')
@Controller(':projectId/documentChunk')
export class DocumentChunkController {
    constructor(private readonly documentChunkService: DocumentChunkService,
                private readonly modelConfigService: ModelConfigService,
                private readonly projectService: ProjectService,
                private readonly tagRelGenerator: TagRelGenerator) {
    }


    @Post('create')
    @ApiOperation({ summary: '创建文档分块（不入库，用于确认）' })
    @Permission(ProjectRole.EDITOR)
    async create(@Param('projectId') projectId: string, @Body() createDocumentChunkDto: CreateDocumentChunkDto) {
        createDocumentChunkDto.projectId = projectId;
        const data = await this.documentChunkService.create(createDocumentChunkDto);
        return ResponseUtil.success(data);
    }


    @Post('chunk')
    @Permission(ProjectRole.EDITOR)
    @ApiOperation({ summary: '创建文档分块并保存' })
    async chunk(@Param('projectId') projectId: string, @Body() createDocumentChunkDto: CreateDocumentChunkDto) {
        createDocumentChunkDto.projectId = projectId;
        const data = await this.documentChunkService.chunkAndSave(createDocumentChunkDto);
        return ResponseUtil.success(data);
    }

    @Post('save')
    @ApiOperation({ summary: '保存文档分块' })
    @Permission(ProjectRole.EDITOR)
    async save(@Param('projectId') projectId: string, @Body() body: { chunkConfigHash: string }) {
        await this.documentChunkService.save(projectId, body.chunkConfigHash);
        return ResponseUtil.success();
    }

    @Post('merge')
    @ApiOperation({ summary: '合并文档分块' })
    @Permission(ProjectRole.EDITOR)
    async merge(@Body() body: { sourceId: string, targetId: string }) {
        await this.documentChunkService.mergeChunks(body.sourceId, body.targetId);
        return ResponseUtil.success();
    }

    @Get()
    @ApiOperation({ summary: '获取文档分块列表' })
    @Permission(ProjectRole.VIEWER)
    async getList(@Query() queryDto: QueryDocumentChunkDto) {
        const data = await this.documentChunkService.getListPagination(queryDto);
        return ResponseUtil.success(data);
    }

    @Get('getInfo/:id')
    @ApiOperation({ summary: '获取文档分块信息' })
    @Permission(ProjectRole.VIEWER)
    async getInfo(@Param('id') id: string) {
        const data = await this.documentChunkService.getInfoById(id);
        return ResponseUtil.success(data);
    }

    @Patch(':id')
    @ApiOperation({ summary: '更新文档分块' })
    @Permission(ProjectRole.EDITOR)
    update(@Param('id') id: string, @Body() updateDocumentChunkDto: UpdateDocumentChunkDto) {
        return this.documentChunkService.update(id, updateDocumentChunkDto);
    }

    @Delete('delete')
    @ApiOperation({ summary: '批量删除文档分块' })
    @Permission(ProjectRole.ADMIN)
    async removeBatch(@Query('ids', new ParseArrayPipe({ items: String, separator: ',' })) ids: string[]) {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return ResponseUtil.badRequest('IDs array is required and cannot be empty');
        }
        const deletedCount = await this.documentChunkService.removeBatch(ids);
        return ResponseUtil.success(null, `${deletedCount} document-chunk(s) deleted successfully`);
    }

    @Post('gen-question')
    @ApiOperation({ summary: '为文本块生成问题' })
    @Permission(ProjectRole.EDITOR)
    async genQuestion(@Param('projectId') projectId: string, @Body() genQuestionDto: GenQuestionDto) {
        genQuestionDto.projectId = projectId;
        const data = await this.documentChunkService.genQuestion(genQuestionDto);
        return ResponseUtil.success(data);
    }

    @Post('gen-tag-rel')
    @ApiOperation({ summary: '为文本块生成标签关系' })
    @Permission(ProjectRole.EDITOR)
    async genTagAndRel(@Param('projectId') projectId: string, @Body() genTagRelDto: GenTagRelDto) {
        const { modelConfigId, chunkId, language } = genTagRelDto;

        // 获取模型配置
        const model = await this.modelConfigService.getModelConfigById(modelConfigId);
        if (!model) {
            return ResponseUtil.error('指定的模型配置不存在');
        }

        // 获取项目数据
        const projectData = await this.projectService.getInfoById(projectId);
        if (!projectData) {
            return ResponseUtil.error('项目数据获取失败');
        }
        // 获取文本块内容
        const chunk = await this.documentChunkService.getInfoById(chunkId);
        if (!chunk) {
            return ResponseUtil.error('文本块数据获取失败');
        }

        const data = await this.tagRelGenerator.generate(chunk, model, projectData, language);
        return ResponseUtil.success(data);
    }


}
