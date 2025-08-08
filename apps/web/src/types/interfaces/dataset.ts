export interface DatasetSamples {
    id: string;
    projectId: string;
    questionId: string;
    question: string;
    answer: string;
    model: string;
    referenceLabel: string;
    evidence: string;
    cot: string;
    confidence: number;
    isPrimaryAnswer: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface DatasetEvaluation {
    id: string;
    sampleId: string;
    sampleType: string;
    type: string; // AI or Human
    model: string; // 打分模型
    factualAccuracyScore: number;
    factualInfo: string;
    logicalIntegrityScore: number;
    logicalInfo: string;
    expressionQualityScore: number;
    expressionInfo: string;
    safetyComplianceScore: number;
    safetyInfo: string;
    compositeScore: number;
    compositeInfo: string;
}
