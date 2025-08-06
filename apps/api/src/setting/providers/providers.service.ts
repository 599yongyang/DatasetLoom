import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CreateProviderDto} from './dto/create-provider.dto';
import {UpdateProviderDto} from './dto/update-provider.dto';
import {PrismaService} from '@/common/prisma/prisma.service';
import {nanoid} from 'nanoid';
import {CryptoUtil} from '@/utils/crypto.util';
import {HttpService} from '@nestjs/axios';
import {ModelProviders} from '@prisma/client';
import {AxiosResponse} from 'axios';


// 统一模型响应接口
export interface ModelItem {
    modelId: string;
    modelName: string;
    providerName: string;
}

@Injectable()
export class ProvidersService {

    constructor(private readonly prisma: PrismaService, private readonly httpService: HttpService) {
    }

    create(createProviderDto: CreateProviderDto) {
        try {
            return this.prisma.modelProviders.create({
                data: {
                    ...createProviderDto,
                    apiKey: CryptoUtil.encrypt(createProviderDto.apiKey),
                    id: nanoid()
                },
            });
        } catch (error) {
            console.error('Failed to save modelProviders in database');
            throw error;
        }
    }

    getList(projectId: string) {
        try {
            return this.prisma.modelProviders.findMany({where: {projectId}});
        } catch (error) {
            console.error('Failed to get modelProviders in database');
            throw error;
        }
    }

    getModelList(providerName: string) {
        try {
            return this.prisma.modelRegistry.findMany({where: {providerName}});
        } catch (error) {
            console.error('Failed to get modelRegistry by providerName in database');
            throw error;
        }
    }

    getProviderById(id: string) {
        try {
            return this.prisma.modelProviders.findUnique({where: {id}});
        } catch (error) {
            console.error('Failed to get modelProviders in database');
            throw error;
        }
    }

    update(updateProviderDto: UpdateProviderDto) {
        try {
            return this.prisma.modelProviders.update({
                data: {
                    ...updateProviderDto,
                    apiKey: CryptoUtil.encrypt(updateProviderDto.apiKey),
                }, where: {id: updateProviderDto.id}
            });
        } catch (error) {
            console.error('Failed to save modelProviders in database');
            throw error;
        }
    }

    remove(id: number) {
        return `This action removes a #${id} provider`;
    }


    async checkModelProviders(projectId: string, name: string) {
        try {
            return await this.prisma.modelProviders.findFirst({where: {projectId, name}});
        } catch (error) {
            console.error('Failed to get modelProviders in database');
            throw error;
        }
    }


    async refreshModelList(provider: ModelProviders) {
        const modelList = await this.getRemoteModelList(provider);
        const models = await this.getModelList(provider.name);
        const existingModelIds = models.map(model => model.modelId);
        const diffModels = modelList.filter((item: any) => !existingModelIds.includes(item.modelId));
        if (diffModels.length > 0) {
            await this.prisma.modelRegistry.createMany({data: diffModels});
        }
        return this.getModelList(provider.name);
    }

    async getRemoteModelList(provider: ModelProviders): Promise<ModelItem[]> {
        try {
            let url = provider.apiUrl.replace(/\/$/, '');
            const providerName = provider.name;

            // 构建 URL 路径
            url += provider.interfaceType === 'ollama' ? '/tags' : '/models';

            // 获取模型数据
            const headers = provider.apiKey
                ? {Authorization: `Bearer ${CryptoUtil.decrypt(provider.apiKey)}`}
                : {};

            const response: AxiosResponse = await this.httpService.axiosRef.get(url, {headers});


            let data: ModelItem[] = [];

            if (provider.interfaceType === 'ollama') {
                data = response.data.models.map((item: any) => ({
                    modelId: item.model,
                    modelName: item.name || item.model,
                    providerName,
                }));
            } else {
                data = response.data.data?.map((item: any) => ({
                    modelId: item.id,
                    modelName: item.id,
                    providerName,
                })) || [];
            }

            return data;
        } catch (error) {
            if (error.response?.status === 401) {
                throw new UnauthorizedException('Invalid API key');
            }
            console.error('Failed to fetch remote model list:', error);
            throw new Error(`Failed to fetch remote model list: ${error.message}`);
        }
    }

}
