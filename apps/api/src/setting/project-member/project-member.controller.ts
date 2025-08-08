import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectMemberService } from './project-member.service';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { ResponseUtil } from '@/utils/response.util';
import { QueryProjectMemberDto } from '@/setting/project-member/dto/query-project-member.dto';
import { UsersService } from '@/users/users.service';
import { User } from '@/auth/decorators/user.decorator';
import { Permission } from '@/auth/decorators/permission.decorator';
import { ProjectRole } from '@repo/shared-types';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('项目成员管理')
@Controller(':projectId/project-member')
export class ProjectMemberController {
    constructor(private readonly projectMemberService: ProjectMemberService, private readonly userService: UsersService) {
    }

    @Post('create')
    @ApiOperation({ summary: '创建项目成员' })
    @Permission(ProjectRole.OWNER)
    async create(@Param('projectId') projectId: string, @Body() createProjectMemberDto: CreateProjectMemberDto, @User('email') currentEmail: string) {
        createProjectMemberDto.projectId = projectId;
        const res = await this.userService.getUserByEmails(createProjectMemberDto.emails.filter(email => email !== currentEmail));
        if (!res || res.length === 0) {
            throw ResponseUtil.error('User does not exist');
        }
        res.map(async item => {
            await this.projectMemberService.save(createProjectMemberDto.projectId, item.id, createProjectMemberDto.role);
        });
        return ResponseUtil.success();
    }

    @Get()
    @ApiOperation({ summary: '获取项目成员列表' })
    @Permission(ProjectRole.OWNER)
    async getList(@Param('projectId') projectId: string, @Query() queryDto: QueryProjectMemberDto) {
        queryDto.projectId = projectId;
        const data = await this.projectMemberService.getListPagination(queryDto);
        return ResponseUtil.success(data);
    }


    @Patch(':id')
    @ApiOperation({ summary: '更新项目成员角色' })
    @Permission(ProjectRole.OWNER)
    async update(@Param('id') id: string, @Body() body: { role: string }) {
        const data = await this.projectMemberService.updateRole(id, body.role);
    }

    @Delete(':id')
    @ApiOperation({ summary: '删除项目成员' })
    @Permission(ProjectRole.OWNER)
    async remove(@Param('id') id: string) {
        await this.projectMemberService.remove(id);
        return ResponseUtil.success();
    }
}
