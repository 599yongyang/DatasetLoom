import { SetMetadata } from '@nestjs/common';
import { ProjectRole } from '@/common/prisma/enum';

export const ROLES_KEY = 'roles';
export const Permission = (role: ProjectRole) =>
    SetMetadata(ROLES_KEY, role);
