import type { Chunks } from '@prisma/client';
import { chunker } from '@/lib/chunker';
import path from 'path';
import { getDefaultModelConfig } from '@/server/db/model-config';
import type { TaskParams, TaskResult } from '@/lib/queue/types';
import { getProject } from '@/server/db/projects';
import { nanoid } from 'nanoid';
import { saveChunks } from '@/server/db/chunks';

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

        // const projectData = await getProject(projectId);

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
                    id: nanoid(),
                    projectId,
                    name: chunkId,
                    documentId: doc.id,
                    documentName: doc.fileName,
                    content: text.pageContent,
                    size: text.pageContent.length
                } as Chunks;
            });
        }
        await saveChunks(chunkList);
        //工作流暂时不主动触发分析chunk
        // const model = await getDefaultModelConfig(projectId);
        // if (model) {
        //     await processChunks({
        //         chunkId: '',
        //         context: '',
        //         model,
        //         language: 'zh',
        //         globalPrompt: projectData?.globalPrompt,
        //         domainTreePrompt: projectData?.domainTreePrompt,
        //         projectId
        //     }).catch(console.error);
        // } else {
        //     throw new Error('Model not found');
        // }

        return {
            success: true,
            data: chunkList,
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
