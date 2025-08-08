import { Controller, Get, Post, Body, Param, Delete, Query, Patch } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ResponseUtil } from '@/utils/response.util';
import { User } from '@/auth/decorators/user.decorator';
import { Permission } from '@/auth/decorators/permission.decorator';
import { ProjectRole } from '@repo/shared-types';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('项目')
@Controller('project')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {
    }

    @ApiOperation({ summary: '创建项目' })
    @Post('create')
    async create(@Body() createProjectDto: CreateProjectDto, @User('id') userId: string) {
        // 验证项目名称是否已存在
        if (await this.projectService.checkNameIsUnique(createProjectDto.name, userId)) {
            return Response.json({ error: '项目名称已存在' }, { status: 400 });
        }
        // 创建项目
        const newProject = await this.projectService.create(createProjectDto, userId);
        // 如果指定了要复用的项目配置
        if (createProjectDto.copyId) {
            await this.projectService.copyModelConfig(newProject.id, createProjectDto.copyId);
        }
        return ResponseUtil.success({ id: newProject.id }, '项目创建成功');
    }

    @Get()
    @ApiOperation({ summary: '获取项目列表' })
    async getList(@Query('name') name: string | undefined, @User('id') userId: string) {
        const data = await this.projectService.getList(name, userId);
        return ResponseUtil.success(data);
    }

    @Get(':id')
    @ApiOperation({ summary: '获取项目信息' })
    async getInfo(@Param('id') id: string) {
        const data = await this.projectService.getInfoById(id);
        return ResponseUtil.success(data);
    }

    @Patch(':projectId')
    @Permission(ProjectRole.EDITOR)
    @ApiOperation({ summary: '更新项目信息' })
    async update(@Param('projectId') projectId: string, @Body() updateProjectDto: UpdateProjectDto) {
        try {
            await this.projectService.update(projectId, updateProjectDto);
            return ResponseUtil.success();
        } catch (error) {
            return ResponseUtil.error('更新项目失败', error);
        }
    }

    @Delete(':projectId')
    @Permission(ProjectRole.OWNER)
    @ApiOperation({ summary: '删除项目' })
    async remove(@Param('projectId') projectId: string) {
        const result = await this.projectService.remove(projectId);
        if (result) {
            return ResponseUtil.success('项目删除成功');
        } else {
            return ResponseUtil.error('项目删除失败');
        }
    }
}
