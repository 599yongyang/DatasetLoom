import { Body, Controller, Delete, Get, Param, ParseArrayPipe, Post, Query } from '@nestjs/common';
import { ImageChunkService } from './image-chunk.service';
import { CreateImageChunkDto } from './dto/create-image-chunk.dto';
import { ResponseUtil } from '@/utils/response.util';
import { QueryImageChunkDto } from '@/chunk/image-chunk/dto/query-image-chunk.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission } from '@/auth/decorators/permission.decorator';
import { ProjectRole } from '@repo/shared-types';
import { GenQuestionImageDto } from '@/chunk/image-chunk/dto/gen-question.dto';

@ApiTags('图像分块')
@Controller(':projectId/image-chunk')
export class ImageChunkController {
    constructor(private readonly imageChunkService: ImageChunkService) {
    }


    @Post('create')
    @ApiOperation({ summary: '创建图像分块' })
    @Permission(ProjectRole.EDITOR)
    create(@Param('projectId') projectId: string, @Body() createImageChunkDto: CreateImageChunkDto) {
        createImageChunkDto.projectId = projectId;
        return this.imageChunkService.create(createImageChunkDto);
    }

    @Permission(ProjectRole.EDITOR)
    @ApiOperation({ summary: '生成问题' })
    @Post('gen-question')
    async genQuestion(@Body() genQuestionDto: GenQuestionImageDto) {
        const data = await this.imageChunkService.genQuestion(genQuestionDto);
        return ResponseUtil.success(data);
    }

    @ApiOperation({ summary: '获取列表' })
    @Permission(ProjectRole.VIEWER)
    @Get()
    async getList(@Param('projectId') projectId: string, @Query() queryDto: QueryImageChunkDto) {
        queryDto.projectId = projectId;
        const data = await this.imageChunkService.getListPagination(queryDto);
        return ResponseUtil.success(data);
    }

    @Permission(ProjectRole.VIEWER)
    @Get('getListByImageId')
    @ApiOperation({ summary: '通过图片id获取列表' })
    async getListByImageId(@Query('imageId') imageId: string) {
        const data = await this.imageChunkService.getListByImageId(imageId);
        return ResponseUtil.success(data);
    }

    @Permission(ProjectRole.ADMIN)
    @Delete('deleteByImageId')
    @ApiOperation({ summary: '通过图片id删除' })
    async deleteByImageId(@Query('imageId') imageId: string) {
        await this.imageChunkService.deleteByImageId(imageId);
        return ResponseUtil.success();
    }

    @Permission(ProjectRole.ADMIN)
    @Delete('delete')
    @ApiOperation({ summary: '批量删除' })
    async removeBatch(@Query('ids', new ParseArrayPipe({ items: String, separator: ',' })) ids: string[]) {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw ResponseUtil.badRequest('IDs array is required and cannot be empty');
        }
        await this.imageChunkService.removeBatch(ids);
        return ResponseUtil.success();
    }
}
