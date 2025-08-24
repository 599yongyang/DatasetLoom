import {
    Controller,
    Post,
    Body,
    Param,
    Delete,
    Get,
    Query,
    ParseArrayPipe,
    Header,
    StreamableFile
} from '@nestjs/common';
import { PretrainService } from './pretrain.service';
import { ApiOperation } from '@nestjs/swagger';
import { Permission } from '@/auth/decorators/permission.decorator';
import { ProjectRole } from '@repo/shared-types';
import { ResponseUtil } from '@/utils/response.util';
import { QueryPretrainDto } from '@/dataset/pretrain/dto/query-pretrain.dto';
import { createReadStream } from 'node:fs';

@Controller(':projectId/pretrain')
export class PretrainController {
    constructor(private readonly pretrainService: PretrainService) {
    }

    @Post('save')
    @ApiOperation({ summary: '保存预训练数据' })
    @Permission(ProjectRole.EDITOR)
    async save(@Param('projectId') projectId: string, @Body() body: { chunkConfigHash: string }) {
        await this.pretrainService.save(projectId, body.chunkConfigHash);
        return ResponseUtil.success();
    }

    @Get()
    @ApiOperation({ summary: '获取预训练数据列表' })
    @Permission(ProjectRole.VIEWER)
    async getList(@Param('projectId') projectId: string, @Query() queryDto: QueryPretrainDto) {
        queryDto.projectId = projectId;
        const data = await this.pretrainService.getListPagination(queryDto);
        return ResponseUtil.success(data);
    }

    @Delete('delete')
    @ApiOperation({ summary: '批量删除' })
    @Permission(ProjectRole.ADMIN)
    async removeBatch(@Query('ids', new ParseArrayPipe({ items: String, separator: ',' })) ids: string[]) {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return ResponseUtil.badRequest('IDs array is required and cannot be empty');
        }
        await this.pretrainService.removeBatch(ids);
        return ResponseUtil.success();
    }

    @Post('export')
    @ApiOperation({ summary: '导出数据集' })
    @Permission(ProjectRole.EDITOR)
    @Header('Content-Type', 'application/zip')
    @Header('Access-Control-Expose-Headers', 'Content-Disposition')
    async export(@Param('projectId') projectId: string): Promise<StreamableFile | any> {
        try {
            const result = await this.pretrainService.exportPretrainDataset(projectId);
            if (result.filePath) {
                const file = createReadStream(result.filePath);
                // 设置文件名
                return new StreamableFile(file, {
                    type: 'application/zip',
                    disposition: `attachment; filename=${result.filename}`
                });
            }

        } catch (error) {
            console.error('获取数据集失败:', error);
            return ResponseUtil.error('获取数据集失败', error);
        }
    }
}
