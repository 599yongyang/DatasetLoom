import type { TaskParams, TaskResult } from '@/lib/queue';
import type { Chunks } from '@prisma/client';
import { chunker } from '@/lib/chunker';
import path from 'path';
import { saveChunks } from '@/lib/db/chunks';
import { processChunks } from '@/app/api/project/[projectId]/documents/chunker/route';
import { db } from '@/server/db';
import { getDefaultModelConfig, getModelConfigById } from '@/lib/db/model-config';

export async function chunkerTask(params: TaskParams): Promise<TaskResult> {
    const { step, inputs, workflowId, projectId } = params;
    const startedAt = new Date();
    try {
        const config = {
            strategy: 'auto',
            chunkSize: 3000,
            chunkOverlap: 125,
            separators: [],
            ...step.data
        };

        console.log(`【${step.name}】【STEP_ID:${step.id}] 节点开始运行 @ ${startedAt.toLocaleString()}`);

        if (!inputs.document?.data) {
            throw new Error('Missing input document data');
        }

        let chunkList: Chunks[] = [];

        for (const doc of inputs.document.data) {
            const data = await chunker(doc.path, config.strategy, {
                chunkSize: config.chunkSize ?? 3000,
                chunkOverlap: config.chunkOverlap ?? 125,
                separators: config.separators
            });

            const fileNameOnly = path.basename(doc.fileName || '');
            const baseName = path.parse(fileNameOnly).name;

            chunkList = data.map((text, index) => {
                const chunkId = `${baseName}-part-${index + 1}`;
                return {
                    projectId,
                    name: chunkId,
                    fileId: doc.id,
                    fileName: doc.fileName,
                    content: text.pageContent,
                    summary: text.pageContent,
                    size: text.pageContent.length
                } as Chunks;
            });
        }

        const chunkRes = await saveChunks(chunkList);

        const project = await db.projects.findUnique({
            where: { id: projectId }
        });
        const model = await getDefaultModelConfig(projectId);

        if (model) {
            await processChunks(chunkRes, model, 'zh').catch(console.error);
        } else {
            throw new Error('Model not found');
        }

        return {
            success: true,
            data: chunkRes,
            startedAt,
            finishedAt: new Date(),
            stepName: step.name,
            stepId: step.id
        };
    } catch (error) {
        console.error(`【${step.name}】执行失败`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            startedAt,
            finishedAt: new Date(),
            stepName: step.name,
            stepId: step.id
        };
    }
}
