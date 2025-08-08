import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParserConfigService } from './parser-config.service';
import { ResponseUtil } from '@/utils/response.util';
import { SaveParserConfigDto } from '@/setting/parser-config/dto/save-parser-config.dto';
import { CryptoUtil } from '@/utils/crypto.util';
import { Permission } from '@/auth/decorators/permission.decorator';
import { ProjectRole } from '@repo/shared-types';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('解析服务配置')
@Controller(':projectId/parser-config')
export class ParserConfigController {
    constructor(private readonly parserConfigService: ParserConfigService) {
    }

    @Post()
    @ApiOperation({ summary: '保存解析服务配置' })
    @Permission(ProjectRole.EDITOR)
    async create(@Param('projectId') projectId: string, @Body() saveParserConfigDto: SaveParserConfigDto) {
        saveParserConfigDto.projectId = projectId;
        await this.parserConfigService.save(saveParserConfigDto);
        return ResponseUtil.success();
    }

    @Get()
    @ApiOperation({ summary: '获取解析服务列表' })
    @Permission(ProjectRole.EDITOR)
    async getList(@Param('projectId') projectId: string) {
        const data = await this.parserConfigService.getList(projectId);
        const list = data.map(item => {
            item.apiKey = CryptoUtil.decrypt(item.apiKey);
            return item;
        });
        return ResponseUtil.success(list);
    }


}
