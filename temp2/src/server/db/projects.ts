'use server';

import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { db } from '@/server/db/db';
import { type Projects } from '@prisma/client';
import { getProjectRoot } from '@/lib/utils/file';
import { ProjectRole } from 'src/server/db/types';

/**
 * 创建新项目
 */
export async function createProject(projectData: { name: string; description: string; ownerId: string }) {
    if (!projectData.name || !projectData.ownerId) {
        throw new Error('Missing required fields: name or ownerId');
    }

    const projectId = nanoid(12);
    let projectRoot = await getProjectRoot();
    let projectDir = path.join(projectRoot, projectId);

    try {
        await createProjectDirectories(projectDir);
        // 使用 Prisma 事务确保数据库操作的原子性
        const [project, projectMember] = await db.$transaction([
            db.projects.create({
                data: {
                    id: projectId,
                    name: projectData.name,
                    description: projectData.description,
                    ownerId: projectData.ownerId
                }
            }),
            db.projectMember.create({
                data: {
                    projectId: projectId,
                    userId: projectData.ownerId,
                    role: ProjectRole.OWNER
                }
            })
        ]);

        return project;
    } catch (error) {
        // 清理已创建的文件夹以避免残留
        if (projectDir && fs.existsSync(projectDir)) {
            try {
                await fs.promises.rm(projectDir, { recursive: true });
            } catch (cleanupError) {
                console.error('Failed to clean up project directory after failure:', cleanupError);
            }
        }

        console.error('Failed to create project:', error);
        throw error;
    }
}

/**
 * 创建项目所需的目录结构
 */
async function createProjectDirectories(projectDir: string) {
    try {
        await fs.promises.mkdir(projectDir, { recursive: true });
        await fs.promises.mkdir(path.join(projectDir, 'files'), { recursive: true });
    } catch (error) {
        console.error('Failed to create project directories:', error);
        throw error;
    }
}

export async function isExistByName(name: string, userId: string) {
    try {
        const count = await db.projects.count({
            where: {
                name: name,
                ownerId: userId
            }
        });
        return count > 0;
    } catch (error) {
        console.error('Failed to get project by name in database');
        throw error;
    }
}

// 获取所有项目
export async function getProjects(name: string, userId: string) {
    try {
        return await db.projects.findMany({
            where: {
                name: {
                    contains: name
                },
                OR: [{ ownerId: userId }, { members: { some: { userId: userId } } }]
            },
            include: {
                _count: {
                    select: {
                        DatasetSamples: true,
                        Questions: true,
                        ModelConfig: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    } catch (error) {
        console.error('Failed to get projects in database');
        throw error;
    }
}

// 获取项目详情
export async function getProject(projectId: string) {
    try {
        return await db.projects.findUnique({ where: { id: projectId } });
    } catch (error) {
        console.error('Failed to get project by id in database');
        throw error;
    }
}

// 更新项目配置

export async function updateProject(projectId: string, projectData: Projects) {
    try {
        return await db.projects.update({
            where: { id: projectId },
            data: { ...projectData }
        });
    } catch (error) {
        console.error('Failed to update project in database');
        throw error;
    }
}

// 删除项目
export async function deleteProject(projectId: string) {
    try {
        const projectRoot = await getProjectRoot();
        const projectPath = path.join(projectRoot, projectId);
        await db.projects.delete({ where: { id: projectId } });
        if (fs.existsSync(projectPath)) {
            await fs.promises.rm(projectPath, { recursive: true });
        }
        return true;
    } catch (error) {
        return false;
    }
}
