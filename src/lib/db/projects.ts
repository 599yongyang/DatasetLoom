'use server';

import fs from 'fs';
import path from 'path';
import { DEFAULT_SETTINGS } from '@/constants/setting';
import { nanoid } from 'nanoid';
import { db } from '@/server/db';
import type { Projects } from '@prisma/client';
import { getProjectRoot } from '@/lib/utils/file';

// 创建新项目
export async function createProject(projectData: { name: string; description: string }) {
    try {
        let projectId = nanoid(12);
        const projectRoot = await getProjectRoot();
        const projectDir = path.join(projectRoot, projectId);
        // 创建项目目录
        await fs.promises.mkdir(projectDir, { recursive: true });
        // 创建子目录
        await fs.promises.mkdir(path.join(projectDir, 'files'), { recursive: true }); // 原始文件
        return await db.projects.create({
            data: {
                id: projectId,
                name: projectData.name,
                description: projectData.description
            }
        });
    } catch (error) {
        console.error('Failed to create project in database');
        throw error;
    }
}

export async function isExistByName(name: string) {
    try {
        const count = await db.projects.count({
            where: {
                name: name
            }
        });
        return count > 0;
    } catch (error) {
        console.error('Failed to get project by name in database');
        throw error;
    }
}

// 获取所有项目
export async function getProjects(name: string) {
    try {
        return await db.projects.findMany({
            where: {
                name: {
                    contains: name
                }
            },
            include: {
                _count: {
                    select: {
                        Datasets: true,
                        Questions: true
                    }
                }
            },
            orderBy: {
                createAt: 'desc'
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
