import type { LabelPromptOptions } from '@/lib/llm/prompts/type';

export default function getLabelPrompt(options: LabelPromptOptions) {
    const { text, globalPrompt, domainTreePrompt } = options;

    const safeGlobalPrompt = globalPrompt ? `- 请始终遵守以下规则：${sanitizeRule(globalPrompt)}` : '';
    const safeDomainTreePrompt = domainTreePrompt
        ? `- 在生成标签时，请参考以下分类体系：${sanitizeRule(domainTreePrompt)}`
        : '';

    const exampleJson = JSON.stringify(
        {
            domain: '科技',
            subDomain: '人工智能',
            tags: ['人工智能', '芯片', '云计算', '阿里巴巴', '投资'],
            summary: '阿里巴巴加大AI芯片研发投入，提升云计算竞争力。',
            entities: [
                { id: 'alibaba_group', type: 'organization', name: '阿里巴巴集团' },
                { id: 'aliyun', type: 'organization', name: '阿里云' },
                { id: 'ai_chip', type: 'technology', name: 'AI芯片' },
                { id: 'ai_inference_chip', type: 'technology', name: 'AI推理芯片' }
            ],
            relations: [
                { source: 'alibaba_group', target: 'ai_chip', relation: '投资研发' },
                { source: 'aliyun', target: 'ai_inference_chip', relation: '应用' },
                { source: 'ai_chip', target: 'ai_inference_chip', relation: '包含' }
            ]
        },
        null,
        2
    );

    return `
你是一个专业的文档分析师，负责为一段文本内容自动生成高质量的标签和元数据，用于后续的知识图谱构建与领域分析。

以下是可供参考的领域分类体系（优先使用子分类）：

- 科技
  - 软件工程
  - 网络安全
  - 人工智能
  - 数据库
  - 系统架构
- 医疗
- 法律
- 教育
- 金融

以下是你的任务要求：

- 不要包含任何额外解释或说明，只输出严格的 JSON。
- domain 根据内容分析出一个相关一级领域词
- subDomain 根据内容分析出一个相关二级领域词
- tags 最多输出 5 个，按相关性排序。
- summary 控制在 50 字以内。
- entities.id 使用规范化的小写+下划线命名方式（如 ai_chip）。

### 输入文本：
\`\`\`
${text}
\`\`\`

### 输出要求：
\`\`\`
{
  "domain": "科技",
  "subDomain": "人工智能",
  "tags": ["人工智能", "芯片", ...],
  "summary": "一句话总结",
  "entities": [
    {"id": "entity_id", "type": "person", "name": "实体名称"}
  ],
  "relations": [
    {"source": "entityA_id", "target": "entityB_id", "relation": "关系描述"}
  ]
}
\`\`\`

### 示例输出：
\`\`\`json
${exampleJson}
\`\`\`

${safeGlobalPrompt}
${safeDomainTreePrompt}
`;
}

function sanitizeRule(rule: string): string {
    return rule?.trim().replace(/\s+/g, ' ') || '';
}
