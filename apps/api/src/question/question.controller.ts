import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseArrayPipe } from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ResponseUtil } from '@/utils/response.util';
import { QueryQuestionDto } from '@/question/dto/query-question.dto';
import { Questions } from '@prisma/client';
import { Permission } from '@/auth/decorators/permission.decorator';
import { ProjectRole } from '@/common/prisma/enum';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('问题管理')
@Controller(':projectId/question')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {
    }


    @Post('create')
    @ApiOperation({ summary: '创建问题'})
    @Permission(ProjectRole.EDITOR)
    async create(@Param('projectId') projectId: string, @Body() createQuestionDto: CreateQuestionDto) {
        createQuestionDto.projectId = projectId;
        const data = await this.questionService.create(createQuestionDto);
        return ResponseUtil.success(data);
    }

    @Get()
    @ApiOperation({ summary: '获取问题列表'})
    @Permission(ProjectRole.VIEWER)
    async getList(@Param('projectId') projectId: string, @Query() queryDto: QueryQuestionDto) {
        queryDto.projectId = projectId;
        const data = await this.questionService.getListPagination(queryDto);
        return ResponseUtil.success(data);
    }


    @Patch('setConfirm')
    @ApiOperation({ summary: '设置问题确认'})
    @Permission(ProjectRole.EDITOR)
    async setConfirm(@Body() body: { id: string, confirmed: boolean }) {
        await this.questionService.update(body.id, { confirmed: body.confirmed } as Questions);
        return ResponseUtil.success();
    }

    @Patch('update')
    @ApiOperation({ summary: '更新问题'})
    @Permission(ProjectRole.EDITOR)
    async update(@Body() updateQuestionDto: UpdateQuestionDto) {
        await this.questionService.update(updateQuestionDto.id, updateQuestionDto as Questions);
        return ResponseUtil.success();
    }

    @Delete('delete')
    @ApiOperation({ summary: '删除问题'})
    @Permission(ProjectRole.EDITOR)
    async removeBatch(@Query('ids', new ParseArrayPipe({ items: String, separator: ',' })) ids: string[]) {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return ResponseUtil.badRequest('IDs array is required and cannot be empty');
        }
        const deletedCount = await this.questionService.removeBatch(ids);
        return ResponseUtil.success(null, `${deletedCount} document-chunk(s) deleted successfully`);
    }
}
