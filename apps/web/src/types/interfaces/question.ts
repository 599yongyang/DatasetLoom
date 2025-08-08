import { DatasetSamples } from '@/types/interfaces/dataset';

export interface Questions {
    id: string;
    projectId: string;
    contextType: string;
    contextId: string;
    contextName: string;
    contextData: string;
    question: string;
    realQuestion: string;
    label: string;
    answered: string;
    deleted: string;
    confirmed: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface QuestionsWithDatasetSample extends Questions {
    DatasetSamples: DatasetSamples[];
}
