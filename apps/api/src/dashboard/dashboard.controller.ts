import { Controller, Get, Param, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ResponseUtil } from '@/utils/response.util';
import { ModelUsageService } from '@/model-usage/model-usage.service';
import { Permission } from '@/auth/decorators/permission.decorator';
import { ProjectRole } from '@/common/prisma/enum';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('看板')
@Controller(':projectId/dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService, private readonly modelUsageService: ModelUsageService) {
    }

    @Get('model-usage')
    @ApiOperation({ summary: '获取模型使用情况' })
    @Permission(ProjectRole.VIEWER)
    async modelUsage(@Param('projectId') projectId: string, @Query('modelConfigId') modelConfigId: string, @Query('day') day: number) {
        const data = await this.modelUsageService.getModelUsageList(projectId, modelConfigId, day);
        return ResponseUtil.success(data);
    }

    @Get('model-use-rank')
    @Permission(ProjectRole.VIEWER)
    @ApiOperation({ summary: '模型使用排名' })
    async modelUseRank(@Param('projectId') projectId: string) {
        const data = await this.modelUsageService.getModelUseRank(projectId);
        return ResponseUtil.success(data);
    }

    @Get('domain')
    @Permission(ProjectRole.VIEWER)
    @ApiOperation({ summary: '获取项目领域' })
    async domain(@Param('projectId') projectId: string, @Query('level') level: number) {
        const data = await this.dashboardService.getChunkDomain(projectId, level === 1 ? 'domain' : 'subDomain');
        return ResponseUtil.success(data);
    }

    @Get('dataset')
    @Permission(ProjectRole.VIEWER)
    @ApiOperation({ summary: '获取项目数据集' })
    async dataset(@Param('projectId') projectId: string) {
        const data = await this.dashboardService.datasetKanbanData(projectId);
        return ResponseUtil.success(data);
    }

}
