import type { TaskParams, TaskResult } from '../types';
import { documentTask } from './document';
import { chunkerTask } from './chunker';
import { questionTask } from './question';
import { datasetTask } from './dataset';
import { startTask } from '@/lib/queue/tasks/start';
import { endTask } from '@/lib/queue/tasks/end';

export const executeTask = async (params: TaskParams): Promise<TaskResult> => {
    switch (params.step.name) {
        case 'start':
            return startTask(params);
        case 'document':
            return documentTask(params);
        case 'chunker':
            return chunkerTask(params);
        case 'question':
            return questionTask(params);
        case 'dataset':
            return datasetTask(params);
        case 'end':
            return endTask(params);
        default:
            throw new Error(`未知步骤类型: ${params.step.name}`);
    }
};
