'use server';
import { db } from '@/server/db';
import type { WorkFlow } from '@prisma/client';

export async function insertWorkflow(workflow: WorkFlow) {
    try {
        return await db.workFlow.upsert({ create: workflow, update: workflow, where: { id: workflow.id } });
    } catch (error) {
        console.error('Failed to create workflow in database');
        throw error;
    }
}

export async function getWorkflow(projectId: string, page = 1, pageSize = 10) {
    try {
        const whereClause: { projectId: string } = { projectId };
        const [data, total] = await Promise.all([
            db.workFlow.findMany({
                where: whereClause,
                orderBy: {
                    createAt: 'desc'
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            db.workFlow.count({
                where: whereClause
            })
        ]);
        return { data, total };
    } catch (error) {
        console.error('Failed to get Workflow by pagination in database');
        throw error;
    }
}

export async function getWorkflowById(workflowId: string) {
    try {
        return await db.workFlow.findUnique({ where: { id: workflowId } });
    } catch (error) {
        console.error('Failed to get Workflow by pagination in database');
        throw error;
    }
}
