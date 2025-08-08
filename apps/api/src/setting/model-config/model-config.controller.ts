import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ModelConfigService } from './model-config.service';
import { SaveModelConfigDto } from './dto/save-model-config.dto';
import { ResponseUtil } from '@/utils/response.util';
import { Permission } from '@/auth/decorators/permission.decorator';
import { ProjectRole } from '@repo/shared-types';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('模型服务配置')
@Controller(':projectId/model-config')
export class ModelConfigController {
    constructor(private readonly modelConfigService: ModelConfigService) {
    }


    @Post('save')
    @ApiOperation({ summary: '保存模型服务配置' })
    @Permission(ProjectRole.EDITOR)
    async save(@Param('projectId') projectId: string, @Body() createModelConfigDto: SaveModelConfigDto) {
        createModelConfigDto.projectId = projectId;
        const data = await this.modelConfigService.save(createModelConfigDto);
        return ResponseUtil.success(data.id);
    }

    @Get('getListByProviderId')
    @ApiOperation({ summary: '获取模型服务列表' })
    @Permission(ProjectRole.VIEWER)
    async getListByProviderId(@Param('projectId') projectId: string, @Query('providerId') providerId: string) {
        const data = await this.modelConfigService.getList(projectId, providerId);
        return ResponseUtil.success(data);
    }

    @Get('getAvailableList')
    @Permission(ProjectRole.VIEWER)
    async getAvailableList(@Param('projectId') projectId: string) {
        const data = await this.modelConfigService.getAvailableList(projectId, true);
        return ResponseUtil.success(data);
    }

    @Patch('setStatus')
    @ApiOperation({ summary: '设置模型状态' })
    @Permission(ProjectRole.EDITOR)
    async setStatus(@Body() body: { id: string, status: boolean }) {
        await this.modelConfigService.updateStatus(body.id, body.status);
        return ResponseUtil.success();
    }

    @Patch('setDefault')
    @ApiOperation({ summary: '设置默认模型' })
    @Permission(ProjectRole.EDITOR)
    async setDefault(@Body() body: { modelId: string }) {
        await this.modelConfigService.updateDefault(body.modelId);
        return ResponseUtil.success();
    }

    @Delete(':id')
    @ApiOperation({ summary: '删除模型' })
    @Permission(ProjectRole.EDITOR)
    async remove(@Param('id') id: string) {
        await this.modelConfigService.remove(id);
        return ResponseUtil.success();
    }
}
