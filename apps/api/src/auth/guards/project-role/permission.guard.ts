import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectRole } from '@repo/shared-types';
import { ROLES_KEY } from '@/auth/decorators/permission.decorator';
import { PermissionsService } from '@/common/permissions/permissions.service';

export type PermissionsType = {
    projectId: string;
    role: ProjectRole;
};

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly permissionService: PermissionsService
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<ProjectRole>(ROLES_KEY, [context.getHandler(), context.getClass()]);

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
        const permissions = await this.permissionService.getPermissions(user.id);
        if (!permissions || permissions.length === 0) {
            throw new ForbiddenException('No permissions found for user');
        }
        // 查找项目权限
        const projectPermission = permissions.find(perm => perm.projectId === projectId);
        if (!projectPermission) {
            throw new ForbiddenException('User does not have permission for this project');
        }

        // 检查权限等级
        const hasPermission = this.permissionService.hasPermission(projectPermission.role, requiredRoles);
        if (!hasPermission) {
            throw new ForbiddenException('User does not have permission for this action');
        } else {
            return hasPermission;
        }
    }


    private extractProjectId(request: any): string | null {
        // 按优先级顺序获取 projectId
        return request.params?.projectId ||
            request.query?.projectId ||
            request.body?.projectId ||
            request.headers?.['x-project-id'] ||
            null;
    }


}
