import {Injectable} from '@nestjs/common';
import {PrismaService} from "@/common/prisma/prisma.service";
import {SaveParserConfigDto} from "@/setting/parser-config/dto/save-parser-config.dto";
import {CryptoUtil} from "@/utils/crypto.util";

@Injectable()
export class ParserConfigService {
    constructor(private readonly prisma: PrismaService) {
    }

    async save(saveParserConfigDto: SaveParserConfigDto) {
        try {
            if (saveParserConfigDto.apiKey) {
                saveParserConfigDto.apiKey = CryptoUtil.encrypt(saveParserConfigDto.apiKey);
            }
            const data = await this.getInfo(saveParserConfigDto.projectId, saveParserConfigDto.serviceId)

            if (data) {
                return  this.update(data.id, saveParserConfigDto);
            } else {
                return this.create(saveParserConfigDto);
            }
        } catch (error) {
            console.error('Failed to create modelConfig in database');
            throw error;
        }
    }

    create(saveParserConfigDto: SaveParserConfigDto) {
        try {
            return this.prisma.parserConfig.create({data: saveParserConfigDto});
        } catch (error) {
            console.error('Failed to create parserConfig in database');
            throw error;
        }
    }

    update(id: string, saveParserConfigDto: SaveParserConfigDto) {
        try {
            return this.prisma.parserConfig.update({where: {id: id}, data: saveParserConfigDto});
        } catch (error) {
            console.error('Failed to update parserConfig in database');
            throw error;
        }
    }

    async getList(projectId: string) {
        try {
            return this.prisma.parserConfig.findMany({where: {projectId}});
        } catch (error) {
            console.error('Failed to get parserConfig list in database');
            throw error;
        }
    }

    getInfo(projectId: string, serviceId: string) {
        try {
            return this.prisma.parserConfig.findFirst({where: {projectId, serviceId}});
        } catch (error) {
            console.error('Failed to get parserConfig by name in database');
            throw error;
        }
    }
}
