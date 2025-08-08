import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { ResponseUtil } from '@/utils/response.util';
import { UpdateProviderDto } from '@/setting/providers/dto/update-provider.dto';
import { CryptoUtil } from '@/utils/crypto.util';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('模型服务商')
@Controller(':projectId/providers')
export class ProvidersController {
    constructor(private readonly providersService: ProvidersService) {
    }

    @ApiOperation({ summary: '添加模型服务商' })
    @Post('create')
    async create(@Param('projectId') projectId: string, @Body() createProviderDto: CreateProviderDto) {
        const check = await this.providersService.checkModelProviders(projectId, createProviderDto.name);
        if (check) {
            return ResponseUtil.error('The providerInfo already exists');
        }
        createProviderDto.projectId = projectId;
        const data = await this.providersService.create(createProviderDto);

        return ResponseUtil.success(data.id);
    }

    @ApiOperation({ summary: '修改模型服务商' })
    @Patch('update')
    async update(@Param('projectId') projectId: string, @Body() updateProviderDto: UpdateProviderDto) {
        updateProviderDto.projectId = projectId;
        const data = await this.providersService.update(updateProviderDto);
        return ResponseUtil.success(data.id);
    }

    @Get()
    @ApiOperation({ summary: '获取模型服务商列表' })
    async getList(@Param('projectId') projectId: string) {
        try {
            const data = await this.providersService.getList(projectId);
            const list = data.map(item => {
                return {
                    ...item,
                    apiKey: item.apiKey ? CryptoUtil.decrypt(item.apiKey) : ''
                };
            });
            return ResponseUtil.success(list);
        } catch (error) {
            return ResponseUtil.error(error.message);
        }
    }

    @Get('getModelList')
    @ApiOperation({ summary: '获取模型列表' })
    async getModelList(@Query('providerName') providerName: string) {
        try {
            const data = await this.providersService.getModelList(providerName);
            return ResponseUtil.success(data);
        } catch (error) {
            return ResponseUtil.error(error.message);
        }
    }

    @Get('refreshModelList')
    @ApiOperation({ summary: '刷新模型列表' })
    async refreshModelList(@Query('providerId') providerId: string) {
        const provider = await this.providersService.getProviderById(providerId);
        if (!provider) {
            return ResponseUtil.error('Provider not found');
        }
        const result = await this.providersService.refreshModelList(provider);
        return ResponseUtil.success(result);
    }

}
