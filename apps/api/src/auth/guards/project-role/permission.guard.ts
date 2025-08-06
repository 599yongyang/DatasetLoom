import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Inject,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectRole } from '@/common/prisma/enum';
import { ROLES_KEY } from '@/auth/decorators/permission.decorator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UsersService } from '@/users/users.service';

export type PermissionsType = {
    projectId: string;
    role: ProjectRole;
};

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly userService: UsersService
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<ProjectRole>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()]
        );

        // 如果没有设置所需角色，则允许访问
        if (!requiredRoles) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // 检查用户是否存在
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const projectId = this.extractProjectId(request);
        if (!projectId) {
            throw new ForbiddenException('Project ID is required for this operation');
        }

        // 获取用户权限
        const permissions = await this.getPermissions(user.id);
        if (!permissions || permissions.length === 0) {
            throw new ForbiddenException('No permissions found for user');
        }
        // 查找项目权限
        const projectPermission = permissions.find(perm => perm.projectId === projectId);
        if (!projectPermission) {
            throw new ForbiddenException('User does not have permission for this project');
        }

        // 检查权限等级
        const hasPermission = this.hasPermission(projectPermission.role, requiredRoles);
        if (!hasPermission) {
            throw new ForbiddenException('User does not have permission for this action');
        } else {
            return hasPermission;
        }
    }

    private hasPermission(userRole: ProjectRole, requiredRole: ProjectRole): boolean {
        const roleHierarchy: Record<ProjectRole, number> = {
            OWNER: 4,
            ADMIN: 3,
            EDITOR: 2,
            VIEWER: 1
        };

        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    }

    private extractProjectId(request: any): string | null {
        // 按优先级顺序获取 projectId
        return request.params?.projectId ||
            request.query?.projectId ||
            request.body?.projectId ||
            request.headers?.['x-project-id'] ||
            null;
    }

    async getPermissions(userId: string): Promise<PermissionsType[]> {
        try {
            // 从缓存中获取权限
            const cachedPermissions = await this.cacheManager.get<PermissionsType[]>(`permission:${userId}`);
            if (cachedPermissions) {
                return cachedPermissions;
            }

            // 如果缓存中没有，从数据库获取
            const userPermissions = await this.userService.getPermissionsById(userId);
            if (!userPermissions || !userPermissions.projectMembers || userPermissions.projectMembers.length === 0) {
                return [];
            }
            const data = userPermissions.projectMembers as PermissionsType[];
            // 将权限存储到缓存中
            await this.cacheManager.set<PermissionsType[]>(
                `permission:${userId}`,
                data,
                1000 * 60 * 60 * 24// 1天缓存
            );
            return data;
        } catch (error) {
            console.error('Error fetching user permissions:', error);
            return [];
        }
    }
}
