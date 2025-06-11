'use server';

import { db } from '@/server/db';
import type { Users } from '@prisma/client';

export async function createUser(user: Users) {
    try {
        return await db.users.create({ data: user });
    } catch (error) {
        console.error('Failed to create users in database');
        throw error;
    }
}

export async function getUserByEmail(email: string) {
    try {
        return await db.users.findFirst({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                role: true,
                avatar: true,
                projectMembers: {
                    select: {
                        projectId: true,
                        role: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Failed to get users by email in database');
        throw error;
    }
}

export async function getUserProjectPermissions(userId: string) {
    try {
        return await db.projectMember.findMany({
            where: { userId },
            select: {
                projectId: true,
                role: true
            }
        });
    } catch (error) {
        console.error('Failed to get users by email in database');
        throw error;
    }
}

export async function hasProjectPermission(userId: string, projectId: string, requiredRoles: string[]) {
    const member = await db.projectMember.findFirst({
        where: { userId, projectId }
    });
    if (!member) {
        return false;
    }
    return requiredRoles.includes(member.role);
}
