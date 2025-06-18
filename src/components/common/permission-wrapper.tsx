import { useCurrentUser } from '@/hooks/use-current-user';
import React from 'react';
import type { ProjectRole } from '@/lib/data-dictionary';
import { hasPermission } from '@/lib/utils/auth-helper';

interface WithPermissionProps {
    projectId: string;
    required: ProjectRole;
    children: React.ReactNode | ((hasAccess: boolean) => React.ReactNode);
    fallback?: React.ReactNode;
}

export const WithPermission: React.FC<WithPermissionProps> = ({ projectId, required, children, fallback = null }) => {
    const user = useCurrentUser();
    const projectPermission = React.useMemo(() => {
        if (!user || !user.permissions) return null;
        return user.permissions.find(perm => perm.projectId === projectId);
    }, [user?.permissions, projectId]);

    const hasAccess = React.useMemo(() => {
        if (!projectPermission) return false;
        return hasPermission(projectPermission.role, required);
    }, [projectPermission, required]);

    if (typeof children === 'function') {
        return <>{children(hasAccess)}</>;
    }
    if (!hasAccess) return <>{fallback}</>;

    return <>{children}</>;
};
