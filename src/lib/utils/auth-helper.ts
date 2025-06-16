import { auth, type CurrentUser } from '@/server/auth';
import type { ProjectRole } from '../data-dictionary';

export async function checkProjectAccess(
    projectId: string,
    requiredRole: ProjectRole
): Promise<{ success: true; user: CurrentUser } | { success: false; status: number; message: string }> {
    const session = await auth();
    if (!session || !session.user) {
        return { success: false, status: 401, message: 'Unauthorized' };
    }

    const currentUser = session.user as CurrentUser;
    const projectPermission = currentUser.permissions.find(item => item.projectId === projectId);

    if (!projectPermission) {
        return { success: false, status: 403, message: 'No permission for this project' };
    }

    const hasAccess = hasPermission(projectPermission.role, requiredRole);
    if (!hasAccess) {
        return { success: false, status: 403, message: 'Forbidden' };
    }

    return { success: true, user: currentUser };
}

export const hasPermission = (userRole: ProjectRole, requiredRole: ProjectRole): boolean => {
    const roleHierarchy: Record<ProjectRole, number> = {
        OWNER: 4,
        ADMIN: 3,
        EDITOR: 2,
        VIEWER: 1
    };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
