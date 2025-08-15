import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseArrayPipe } from '@nestjs/common';
import { PromptTemplateService } from './prompt-template.service';
import { CreatePromptTemplateDto } from './dto/create-prompt-template.dto';
import { UpdatePromptTemplateDto } from './dto/update-prompt-template.dto';
import { QueryPromptTemplateDto } from '@/setting/prompt-template/dto/query-prompt-template.dto';
import { ResponseUtil } from '@/utils/response.util';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission } from '@/auth/decorators/permission.decorator';
import { ProjectRole } from '@repo/shared-types';

@ApiTags('提示词管理')
@Controller(':projectId/prompt-template')
export class PromptTemplateController {
    constructor(private readonly promptTemplateService: PromptTemplateService) {
    }

    @ApiOperation({ summary: '创建提示词' })
    @Post('create')
    @Permission(ProjectRole.ADMIN)
    async create(@Param('projectId') projectId: string, @Body() createPromptTemplateDto: CreatePromptTemplateDto) {
        createPromptTemplateDto.projectId = projectId;
        const data = await this.promptTemplateService.create(createPromptTemplateDto);
        return ResponseUtil.success(data.id);
    }

    @ApiOperation({ summary: '获取提示词列表(分页)' })
    @Get()
    async getList(@Param('projectId') projectId: string, @Query() queryDto: QueryPromptTemplateDto) {
        queryDto.projectId = projectId;
        const data = await this.promptTemplateService.getListPagination(queryDto);
        return ResponseUtil.success(data);
    }

    @ApiOperation({ summary: '获取提示词详情' })
    @Get('getInfo/:id')
    async findOne(@Param('projectId') projectId: string, @Param('id') id: string) {
        const data = await this.promptTemplateService.getInfoById(id, projectId);
        return ResponseUtil.success(data);
    }

    @ApiOperation({ summary: '获取提示词列表' })
    @Get('select')
    async select(@Param('projectId') projectId: string, @Query('type') type: string) {
        console.log(type, projectId);
        const data = await this.promptTemplateService.select(projectId, type);
        return ResponseUtil.success(data);
    }

    @Patch()
    @ApiOperation({ summary: '更新提示词' })
    @Permission(ProjectRole.ADMIN)
    update(@Body() updatePromptTemplateDto: UpdatePromptTemplateDto) {
        return this.promptTemplateService.update(updatePromptTemplateDto);
    }

    @Delete('delete')
    @ApiOperation({ summary: '删除提示词' })
    @Permission(ProjectRole.ADMIN)
    async removeBatch(@Query('ids', new ParseArrayPipe({ items: String, separator: ',' })) ids: string[]) {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return ResponseUtil.badRequest('IDs array is required and cannot be empty');
        }
        const deletedCount = await this.promptTemplateService.removeBatch(ids);
        return ResponseUtil.success(null, `${deletedCount} document-chunk(s) deleted successfully`);
    }
}
