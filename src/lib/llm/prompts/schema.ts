import { z } from 'zod';

const entitySchema = z.object({
    id: z.string(),
    type: z.string(),
    name: z.string()
});

const relationSchema = z.object({
    source: z.string(),
    target: z.string(),
    relation: z.string()
});

export const documentAnalysisSchema = z.object({
    domain: z.string().describe('文档所属领域，例如 科技、法律、医疗 等'),
    subDomain: z.string().describe('文档所属二级领域，例如 软件工程、网络安全、人工智能、数据库、系统架构 等'),
    tags: z.array(z.string()).describe('关键词/主题标签，最多5个'),
    summary: z.string().describe('一句话总结核心内容'),
    entities: z.array(entitySchema).optional().default([]),
    relations: z.array(relationSchema).optional().default([])
});

const questionSchema = z.object({
    question: z.string().min(1, '问题不能为空'),
    label: z.array(z.string()).min(1, '至少需要一个标签')
});

export const questionsSchema = z.array(questionSchema);

const evidenceSchema = z.object({
    text: z.string(),
    location: z.string()
});

export const answerSchema = z.object({
    answer: z.string(),
    evidence: z.array(evidenceSchema),
    confidence: z.number().min(0).max(1) // 置信度应在 0~1 之间
});

// Scores 对象 Schema
const scoresSchema = z.object({
    factualAccuracy: z.number().min(0).max(1),
    logicalIntegrity: z.number().min(0).max(1),
    expressionQuality: z.number().min(0).max(1),
    safetyCompliance: z.number().min(0).max(1),
    compositeScore: z.number()
});

// Diagnostics 对象 Schema
const diagnosticsSchema = z.object({
    factualInfo: z.string().optional(),
    logicalInfo: z.string().optional(),
    expressionInfo: z.string().optional(),
    safetyInfo: z.string().optional(),
    compositeInfo: z.string().optional()
});

export const aiScoreSchema = z.object({
    scores: scoresSchema,
    diagnostics: diagnosticsSchema
});
