import {
    Controller,
    Delete,
    Get,
    Param,
    ParseArrayPipe,
    Post,
    Query,
    UploadedFiles,
    UseInterceptors
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ResponseUtil } from '@/utils/response.util';
import { QueryImageDto } from '@/knowledge/images/dto/query-image.dto';
import { ModelConfigService } from '@/setting/model-config/model-config.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission } from '@/auth/decorators/permission.decorator';
import { ProjectRole } from '@/common/prisma/enum';

@ApiTags('图像库')
@Controller(':projectId/images')
export class ImagesController {
    constructor(private readonly imagesService: ImagesService, private readonly modelConfigService: ModelConfigService) {
    }

    @Post('upload')
    @ApiOperation({ summary: '上传图像' })
    @Permission(ProjectRole.EDITOR)
    @UseInterceptors(FilesInterceptor('files'))
    async uploadFile(@Param('projectId') projectId: string, @Query('mid') mid: string, @UploadedFiles() files: Array<Express.Multer.File>) {
        // 验证是否有上传文件
        if (!files || files.length === 0) {
            return ResponseUtil.badRequest('No files uploaded');
        }
        const modelConfig = await this.modelConfigService.getModelConfigById(mid);
        if (!modelConfig) {
            return ResponseUtil.badRequest('No model config found');
        }
        const savedFiles = await this.imagesService.saveImageFile(modelConfig, projectId, files);

        return ResponseUtil.success(savedFiles, `${files.length} file(s) uploaded successfully`);
    }


    @Get()
    @ApiOperation({ summary: '获取图像库列表' })
    @Permission(ProjectRole.VIEWER)
    async getList(@Query() queryDto: QueryImageDto) {
        const data = await this.imagesService.getListPagination(queryDto);
        return ResponseUtil.success(data);
    }

    @Delete('delete')
    @ApiOperation({ summary: '删除图像' })
    @Permission(ProjectRole.ADMIN)
    async removeBatch(@Query('ids', new ParseArrayPipe({ items: String, separator: ',' })) ids: string[]) {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw ResponseUtil.badRequest('IDs array is required and cannot be empty');
        }
        const deletedCount = await this.imagesService.removeBatch(ids);
        return ResponseUtil.success(null, `${deletedCount} document(s) deleted successfully`);
    }

}
