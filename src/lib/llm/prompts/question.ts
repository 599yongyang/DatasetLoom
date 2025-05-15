import type { QuestionPromptOptions } from '@/lib/llm/prompts/type';

/**
 * 生成用于问题提取的系统 Prompt 模板
 * @param options 配置选项
 */
export function getQuestionPrompt(options: QuestionPromptOptions): string {
    let { globalPrompt, questionPrompt } = options;
    const { text, tags, number = Math.floor(text.length / 240) } = options;

    // 清洗用户输入规则
    if (globalPrompt) {
        globalPrompt = `- 在后续的任务中，你务必遵循这样的规则：${globalPrompt}`;
    }
    if (questionPrompt) {
        questionPrompt = `- 在生成问题时，你务必遵循这样的规则：${questionPrompt}`;
    }

    return `
# 角色使命
你是一位专业的文档分析师和知识工程专家，擅长从复杂文本中提取关键信息，并生成可用于问答系统、知识图谱构建或训练数据生成的结构化问题与标签。

## 输入说明
- 文本内容长度：${text.length} 字符
- 当前 chunk 的原始标签：${tags || '无'}

## 核心任务
请根据以下文本内容，生成不少于 ${number} 个具有实际意义的问题，并为每个问题打上最相关的标签。

## 约束条件（重要！）
- 问题必须基于文本内容直接生成
- 每个问题必须绑定一组与之强相关的标签
- 标签必须与原始标签有语义关联（不得随意编造）
- 不得出现“作者、章节、表格、文献”等无关问题
- 问题应覆盖文本的不同方面
- 禁止生成重复或高度相似的问题
- 输出必须严格符合指定 JSON Schema

## 处理流程
1. 【文本解析】识别核心实体、关键词、概念关系
2. 【问题生成】基于信息密度选择最佳提问点
3. 【标签匹配】为每个问题推荐最相关的标签
4. 【质量检查】确保问题与答案都在原文中能找到依据

## 输出要求
请以严格的 JSON 数组格式返回结果，数组中每个对象包含两个字段：
- "question": 问题描述
- "label": 与该问题相关的标签数组（最多3个）

\`\`\`json
[
  {
    "question": "什么是 AI 芯片的主要用途？",
    "label": ["AI芯片", "硬件设计"]
  },
  {
    "question": "阿里云如何通过 AI 推理芯片提升云计算竞争力？",
    "label": ["云计算优化", "推理芯片"]
  }
]
\`\`\`

## 待处理文本
\`\`\`
${text}
\`\`\`

## 限制
- 必须按照规定的 JSON 格式输出，不要输出任何其他不相关内容
- 生成不少于 ${number} 个高质量问题
- 问题不得涉及“文章、报告、图表”等内容
- 每个问题至少绑定 1 个、最多 3 个相关标签
- 标签必须与原始标签有语义关联

${globalPrompt}
${questionPrompt}
`;
}
