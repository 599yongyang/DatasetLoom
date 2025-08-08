import React from 'react';
import type { ProjectRole } from '@repo/shared-types';
import { useAtomValue } from 'jotai/index';
import { userInfoAtom } from '@/atoms';
import { hasPermission } from '@/lib/utils';

interface WithPermissionProps {
    projectId: string;
    required: ProjectRole;
    children: React.ReactNode | ((hasAccess: boolean) => React.ReactNode);
    fallback?: React.ReactNode;
}

export const WithPermission: React.FC<WithPermissionProps> = ({
                                                                  projectId,
                                                                  required,
                                                                  children,
                                                                  fallback = null
                                                              }) => {
    const user = useAtomValue(userInfoAtom);
    // 计算项目权限
    const projectPermission = React.useMemo(() => {
        if (!user || !user.permissions) return null;
        return user.permissions.find(perm => perm.projectId === projectId);
    }, [user, projectId]);

    // 计算访问权限
    const hasAccess = React.useMemo(() => {
        if (!projectPermission) return false;
        return hasPermission(projectPermission.role as ProjectRole, required);
    }, [projectPermission, required]);


    // 对于函数子组件，传递当前的访问状态（即使还在加载中）
    if (typeof children === 'function') {
        // 在加载期间传递当前的 hasAccess 值（可能是 false）
        return <>{children(hasAccess)}</>;
    }

    // 加载完成后，根据权限显示内容或 fallback
    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
