import type { LabelPromptOptions } from '@/lib/ai/prompts/type';
import { languageMap } from '@/constants/prompt';

export default function getLabelPrompt(options: LabelPromptOptions) {
    const { text, language = 'zh', globalPrompt, domainTreePrompt } = options;

    const safeGlobalPrompt = globalPrompt ? `- 请始终遵守以下规则：${sanitizeRule(globalPrompt)}` : '';
    const safeDomainTreePrompt = domainTreePrompt
        ? `- 在生成标签时，请参考以下分类体系：${sanitizeRule(domainTreePrompt)}`
        : '';

    const outputLanguage = languageMap[language] || '中文';

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
# 角色使命
你是一个专业的文档分析师，擅长从复杂文本中提取关键信息，并生成可用于知识图谱构建的结构化元数据。

## 输入说明
- 文本长度：${text.length} 字符
- 输出语言：${outputLanguage}

## 核心任务
请根据以下文本内容，生成结构化标签与元数据，要求：
- 领域（domain）根据内容分析出一个相关一级领域词
- 子领域（subDomain）根据内容分析出一个相关二级领域词
- 标签（tags）最多5个，按相关性排序
- 实体（entities）需命名规范化（如 ai_chip）
- 关系（relations）需符合逻辑


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


## 处理流程
1. 【文本解析】识别核心实体、关键词、概念关系
2. 【标签生成】基于信息密度选择最佳标签
3. 【结构化输出】确保符合 JSON Schema 要求

## 分类体系参考
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

## 其他规则
${safeGlobalPrompt}
${safeDomainTreePrompt}

### 待处理文本
\`\`\`
${text}
\`\`\`

## 输出要求
请以严格的 JSON 格式返回结果，不要输出任何其他内容

### 示例输出：
\`\`\`json
${exampleJson}
\`\`\`

`;
}

function sanitizeRule(rule: string): string {
    return rule?.trim().replace(/\s+/g, ' ') || '';
}
