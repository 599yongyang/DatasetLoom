'use server';

import { db } from '@/server/db';

export async function getProjectMember(projectId: string, input: string) {
    try {
        return await db.projectMember.findMany({
            where: {
                projectId,
                OR: [{ user: { name: { contains: input } } }, { user: { email: { contains: input } } }]
            },
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
            }
        });
    } catch (error) {
        console.error('Failed to get project member in database');
        throw error;
    }
}

export async function addProjectMember(projectId: string, userId: string, role: string) {
    try {
        const exist = await db.projectMember.findFirst({ where: { projectId, userId } });
        if (exist) {
            return await db.projectMember.update({ where: { id: exist.id }, data: { role } });
        } else {
            return await db.projectMember.create({
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

export async function removeProjectMember(id: string) {
    try {
        return await db.projectMember.delete({ where: { id } });
    } catch (error) {
        console.error('Failed to remove project member in database');
        throw error;
    }
}

export async function updateProjectMemberRole(id: string, role: string) {
    try {
        return await db.projectMember.update({
            where: { id },
            data: { role }
        });
    } catch (error) {
        console.error('Failed to update project member role in database');
        throw error;
    }
}
