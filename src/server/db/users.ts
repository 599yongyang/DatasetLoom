'use server';

import { db } from '@/server/db/db';
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

export async function getUserById(id: string) {
    try {
        return await db.users.findUnique({ where: { id } });
    } catch (error) {
        console.error('Failed to get users by id in database');
        throw error;
    }
}

export async function updateUser(name: string, avatar: string, userId: string) {
    try {
        const data: { name: string; avatar?: string } = { name };
        if (avatar !== '') {
            data.avatar = avatar;
        }

        return await db.users.update({
            where: { id: userId },
            data
        });
    } catch (error) {
        console.error('Failed to update user in database');
        throw error;
    }
}

export async function updatePassword(id: string, password: string) {
    try {
        return await db.users.update({
            where: { id },
            data: { password }
        });
    } catch (error) {
        console.error('Failed to update user password in database');
        throw error;
    }
}

export async function getUserByEmails(emails: string[]) {
    try {
        return await db.users.findMany({
            where: { email: { in: emails } },
            select: {
                id: true,
                email: true
            }
        });
    } catch (error) {
        console.error('Failed to get users by emails in database');
        throw error;
    }
}
