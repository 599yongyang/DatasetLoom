import { Inject, Injectable } from '@nestjs/common';
import { QueryProjectMemberDto } from '@/setting/project-member/dto/query-project-member.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UsersService } from '@/users/users.service';
import { PermissionsType } from '@/auth/guards/project-role/permission.guard';

@Injectable()
export class ProjectMemberService {
    constructor(private readonly prisma: PrismaService,
                @Inject(CACHE_MANAGER) private cacheManager: Cache,
                private readonly userService: UsersService) {
    }


    async save(projectId: string, userId: string, role: string) {
        try {
            const exist = await this.prisma.projectMember.findFirst({ where: { projectId, userId } });
            if (exist) {
                return await this.prisma.projectMember.update({ where: { id: exist.id }, data: { role } });
            } else {
                return await this.prisma.projectMember.create({
                    data: {
                        projectId,
                        userId,
                        role
                    }
                });
            }
        } catch (error) {
            console.error('Failed to add project member in database');
            throw error;
        }
    }


    async getListPagination(queryDto: QueryProjectMemberDto) {
        try {
            const { projectId, page, pageSize, query } = queryDto;
            const whereClause: Prisma.ProjectMemberWhereInput = {
                projectId,
                OR: [{ user: { name: { contains: query } } }, { user: { email: { contains: query } } }]
            };
            const [data, total] = await Promise.all([
                this.prisma.projectMember.findMany({
                    where: whereClause,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true
                            }
                        }
                    },
                    orderBy: {
                        joinedAt: 'asc'
                    },
                    skip: (page - 1) * pageSize,
                    take: pageSize
                }),
                this.prisma.projectMember.count({
                    where: whereClause
                })
            ]);

            return { data, total };
        } catch (error) {
            console.error('Failed to get projectMember by projectId in database');
            throw error;
        }
    }

    remove(id: string) {
        try {
            return this.prisma.projectMember.delete({ where: { id } });
        } catch (error) {
            console.error('Failed to remove project member in database');
            throw error;
        }
    }

    async updateRole(id: string, role: string) {
        try {
            await this.prisma.projectMember.update({
                where: { id },
                data: { role }
            });
            const userPermissions = await this.userService.getPermissionsById(id);
            if (!userPermissions || !userPermissions.projectMembers || userPermissions.projectMembers.length === 0) {
                return [];
            }
            const data = userPermissions.projectMembers as PermissionsType[];
            // 将权限存储到缓存中
            await this.cacheManager.set<PermissionsType[]>(
                `permission:${id}`,
                data,
                1000 * 60 * 60 * 24// 1天缓存
            );
        } catch (error) {
            console.error('Failed to update project member role in database');
            throw error;
        }
    }
}
