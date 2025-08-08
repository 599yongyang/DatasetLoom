export interface PreferencePair {
    id: string;
    projectId: string;
    questionId: string;
    prompt: string;
    chosen: string;
    rejected: string;
    datasetChosenId: string;
    datasetRejectId: string;
    createdAt: Date;
    updatedAt: Date;
}
