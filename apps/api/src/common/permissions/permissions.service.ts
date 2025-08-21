import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UsersService } from '@/users/users.service';
import { PermissionsType } from '@/auth/guards/project-role/permission.guard';
import { ProjectRole } from '@repo/shared-types';

@Injectable()
export class PermissionsService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly userService: UsersService
    ) {
    }

    private readonly CACHE_PREFIX = 'permission:';

    private getCacheKey(userId: string): string {
        return `${this.CACHE_PREFIX}${userId}`;
    }

    async getPermissions(userId: string): Promise<PermissionsType[]> {
        try {
            const cacheKey = this.getCacheKey(userId);
            // 从缓存中获取权限
            const cachedPermissions = await this.cacheManager.get<PermissionsType[]>(cacheKey);
            if (cachedPermissions) {
                return cachedPermissions;
            }
            return await this.refreshPermissions(userId);
        } catch (error) {
            console.error('Error fetching user permissions:', error);
            return [];
        }
    }


    async refreshPermissions(userId: string) {
        const cacheKey = this.getCacheKey(userId);
        const userPermissions = await this.userService.getPermissionsById(userId);
        if (!userPermissions || !userPermissions.projectMembers || userPermissions.projectMembers.length === 0) {
            return [];
        }
        const data = userPermissions.projectMembers as PermissionsType[];
        await this.cacheManager.set<PermissionsType[]>(cacheKey, data, 1000 * 60 * 60 * 24);// 1天缓存
        return data;
    }

    hasPermission(userRole: ProjectRole, requiredRole: ProjectRole): boolean {
        const roleHierarchy: Record<ProjectRole, number> = {
            OWNER: 4,
            ADMIN: 3,
            EDITOR: 2,
            VIEWER: 1
        };

        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    }
}
