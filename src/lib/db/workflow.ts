'use server';
import { db } from '@/server/db';
import type { WorkFlow } from '@prisma/client';
import { getSortedWorkflowNodes } from '@/lib/dag/sort';

export async function insertWorkflow(workflow: WorkFlow) {
    const { id, nodes, edges } = workflow;
    // 解析 nodes JSON 字符串
    let nodeList = [];
    let edgeList = [];
    try {
        nodeList = JSON.parse(nodes);
        edgeList = JSON.parse(edges);
    } catch (error) {
        console.error('Failed to parse workflow nodes JSON');
        throw new Error('Invalid nodes JSON format');
    }
    const sortedSteps = getSortedWorkflowNodes(nodeList, edgeList);

    const workflowSteps = sortedSteps.map(step => ({
        ...step,
        workflowId: id
    }));

    try {
        return await db.$transaction(async tx => {
            // 1. 首先确保 workflow 存在
            const workflowResult = await tx.workFlow.upsert({
                where: { id },
                update: workflow,
                create: workflow
            });

            // 2. 然后处理步骤（先删后增）
            await tx.workflowStep.deleteMany({
                where: { workflowId: id }
            });

            if (workflowSteps.length > 0) {
                await tx.workflowStep.createMany({
                    data: workflowSteps
                });
            }

            return workflowResult;
        });
    } catch (error) {
        console.error('Failed to insert/update workflow and steps:', error);

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
                    createdAt: 'desc'
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
        return await db.workFlow.findUnique({ where: { id: workflowId }, include: { steps: true } });
    } catch (error) {
        console.error('Failed to get Workflow by id in database');
        throw error;
    }
}

export async function deleteWorkflow(workflowId: string) {
    try {
        return await db.workFlow.delete({ where: { id: workflowId } });
    } catch (error) {
        console.error('Failed to delete Workflow by id in database');
        throw error;
    }
}
