export interface ProjectCounts {
    DatasetSamples: number;
    Questions: number;
    ModelConfig: number;
}

export interface ProjectsWithCounts {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    globalPrompt: string;
    questionPrompt: string;
    answerPrompt: string;
    labelPrompt: string;
    domainTreePrompt: string;
    createdAt: Date;
    updatedAt: Date;
    _count: ProjectCounts;
}
