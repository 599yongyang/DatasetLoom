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
