import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseInterceptors,
    UploadedFiles, Query, ParseArrayPipe
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ResponseUtil } from '@/utils/response.util';
import { QueryDocumentDto } from '@/knowledge/document/dto/query-document.dto';
import { ParserDocumentDto } from '@/knowledge/document/dto/parser-document.dto';
import { ParserFactory } from '@/utils/parser/parser-factory';
import { ParserConfig } from '@prisma/client';
import { ParserConfigService } from '@/setting/parser-config/parser-config.service';
import type { Parser } from '@/utils/parser/types';
import { DocumentChunkGraphService } from '@/chunk/document-chunk/document-chunk-graph.service';
import { Permission } from '@/auth/decorators/permission.decorator';
import { ProjectRole } from '@repo/shared-types';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('文档库')
@Controller(':projectId/document')
export class DocumentController {
    constructor(private readonly documentService: DocumentService, private readonly parserConfigService: ParserConfigService,
                private readonly chunkGraphService: DocumentChunkGraphService) {
    }


    @Post('parser')
    @ApiOperation({ summary: '解析文档' })
    @Permission(ProjectRole.EDITOR)
    @UseInterceptors(FilesInterceptor('localFiles'))
    async previewChunks(
        @Param('projectId') projectId: string,
        @UploadedFiles() localFiles: Array<Express.Multer.File>,
        @Body() parserDocumentDto: ParserDocumentDto
    ) {
        const { sourceType, selectedService, webUrls } = parserDocumentDto;
        // 验证输入参数
        if (sourceType === 'local' && (!localFiles || localFiles.length === 0)) {
            return ResponseUtil.badRequest('No files uploaded');
        }

        let parsedWebUrls = [];
        if (sourceType === 'webUrl') {
            try {
                parsedWebUrls = JSON.parse(webUrls || '[]');
                if (!Array.isArray(parsedWebUrls) || parsedWebUrls.length === 0) {
                    return ResponseUtil.badRequest('webUrls must be a valid array');
                }
            } catch (error) {
                return ResponseUtil.badRequest('Invalid JSON format in webUrls');
            }
        }

        // 获取解析器配置
        let parser: Parser;
        if (selectedService !== 'native') {
            const parserConfig = await this.parserConfigService.getInfo(projectId, selectedService);
            if (!parserConfig) {
                return ResponseUtil.notFound('Parser config not found');
            }
            parser = ParserFactory.createParser(parserConfig);
        } else {
            parser = ParserFactory.createParser({ serviceId: selectedService } as ParserConfig);
        }

        try {
            let ids: string[];
            // 处理本地文件上传
            if (sourceType === 'local') {
                ids = await this.documentService.saveDocumentByLocalFile(projectId, localFiles, parser);
            }
            // 处理网页 URL 解析
            else if (sourceType === 'webUrl') {
                ids = await this.documentService.saveDocumentByWebUrl(projectId, parsedWebUrls, parser);
            } else {
                return ResponseUtil.badRequest('Invalid sourceType. Must be "local" or "webUrl"');
            }

            return ResponseUtil.success(ids, 'Documents processed successfully');
        } catch (error) {
            return ResponseUtil.error(error.message || 'Failed to process documents');
        }
    }

    @Get()
    @ApiOperation({ summary: '获取文档库列表' })
    @Permission(ProjectRole.VIEWER)
    async getList(@Param('projectId') projectId: string, @Query() queryDto: QueryDocumentDto) {
        queryDto.projectId = projectId;
        const data = await this.documentService.getListPagination(queryDto);
        return ResponseUtil.success(data);
    }

    @Get('graph')
    @ApiOperation({ summary: '获取文档库关系图' })
    @Permission(ProjectRole.VIEWER)
    async graph(@Param('projectId') projectId: string, @Query('id') id: string) {
        const data = await this.chunkGraphService.getChunkGraph(projectId, [id]);
        return ResponseUtil.success(data);
    }

    @Delete('delete')
    @ApiOperation({ summary: '删除文档' })
    @Permission(ProjectRole.ADMIN)
    async removeBatch(@Query('ids', new ParseArrayPipe({ items: String, separator: ',' })) ids: string[]) {

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return ResponseUtil.badRequest('IDs array is required and cannot be empty');
        }
        const deletedCount = await this.documentService.removeBatch(ids);
        return ResponseUtil.success(null, `${deletedCount} document(s) deleted successfully`);
    }


}
