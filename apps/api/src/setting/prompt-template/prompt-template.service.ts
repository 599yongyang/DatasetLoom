import { Injectable } from '@nestjs/common';
import { CreatePromptTemplateDto } from './dto/create-prompt-template.dto';
import { UpdatePromptTemplateDto } from './dto/update-prompt-template.dto';
import { PrismaService } from '@/common/prisma/prisma.service';
import { QueryProjectMemberDto } from '@/setting/project-member/dto/query-project-member.dto';
import { Prisma } from '@prisma/client';
import { QueryPromptTemplateDto } from '@/setting/prompt-template/dto/query-prompt-template.dto';

@Injectable()
export class PromptTemplateService {

    constructor(private readonly prisma: PrismaService) {
    }

    create(createPromptTemplateDto: CreatePromptTemplateDto) {
        return this.prisma.promptTemplate.create({ data: createPromptTemplateDto });
    }

    async getListPagination(queryDto: QueryPromptTemplateDto) {
        try {
            const { projectId, page, pageSize, name } = queryDto;
            const whereClause: Prisma.PromptTemplateWhereInput = {
                projectId,
                name: name ? { contains: name } : undefined
            };
            const [data, total] = await Promise.all([
                this.prisma.promptTemplate.findMany({
                    where: whereClause,
                    orderBy: {
                        updatedAt: 'desc'
                    },
                    skip: (page - 1) * pageSize,
                    take: pageSize
                }),
                this.prisma.promptTemplate.count({
                    where: whereClause
                })
            ]);

            return { data, total };
        } catch (error) {
            console.error('Failed to get promptTemplate by projectId in database');
            throw error;
        }
    }

    getInfoById(id: string, projectId: string) {
        return this.prisma.promptTemplate.findUnique({
            where: { id, projectId }
        });
    }

    select(projectId: string, type: string) {
        return this.prisma.promptTemplate.findMany({
            where: { type, projectId }
        });
    }

    update(updatePromptTemplateDto: UpdatePromptTemplateDto) {
        return this.prisma.promptTemplate.update({
            where: { id: updatePromptTemplateDto.id },
            data: { ...updatePromptTemplateDto, variables: JSON.parse(updatePromptTemplateDto.variables) }
        });
    }

    async removeBatch(ids: string[]) {
        try {
            return this.prisma.promptTemplate.deleteMany({
                where: {
                    id: {
                        in: ids
                    }
                }
            });
        } catch (error) {
            console.error('Failed to delete batch promptTemplate in database');
            throw error;
        }
    }
}
