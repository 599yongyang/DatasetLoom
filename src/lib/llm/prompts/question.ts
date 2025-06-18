import type { QuestionPromptOptions } from '@/lib/llm/prompts/type';
import { difficultyMap, languageMap, styleMap } from '@/constants/prompt';

/**
 * 生成用于问题生成的系统 Prompt 模板
 */
export function getQuestionPrompt(options: QuestionPromptOptions): string {
    const {
        text,
        tags,
        number = calculateOptimalQuestionCount(text),
        difficulty = 'medium',
        audience = 'general',
        genre = 'neutral',
        language = 'zh',
        globalPrompt,
        questionPrompt
    } = options;

    const currentStyle = styleMap[genre] || genre;
    // 清洗用户输入规则
    const sanitizedGlobalPrompt = globalPrompt ? `\n## 全局规则\n${globalPrompt}` : '';
    const sanitizedQuestionPrompt = questionPrompt ? `\n## 问题生成专项规则\n${questionPrompt}` : '';

    const outputLanguage = languageMap[language] || '中文';
    return `
# 角色使命
你是一位资深的知识工程专家和内容重构专家，擅长从复杂文本中提取关键信息，并根据指定风格和受众生成多样化的问题。你的输出语言必须为 ${outputLanguage}。${sanitizedGlobalPrompt}

## 输入说明
- 文本长度: ${text.length} 字符
- 原始标签: [${tags || '无'}]
- 预期问题数: ${number}
- 难度级别: ${difficulty} (${difficultyMap[difficulty]?.depth})
- 问题类型比例: ${difficultyMap[difficulty]?.ratio} (事实:推理:开放)
- 风格要求: ${currentStyle}
- 受众类型: ${audience}

## 核心任务
1. 对输入文本进行风格-受众适配的重构（保持信息完整）
2. 在重构文本基础上生成不少于 ${number} 个高质量问题
${sanitizedQuestionPrompt}

## 问题生成原则
- 【信息密度优先】选择概念密集段落生成问题
- 【认知层级分布】按指定比例生成:
   - 事实性问题 (Who/What/When/Where)
   - 推理性问题 (Why/How)
   - 开放性/应用性问题
- 【上下文感知】长文本中保持逻辑连贯

## 标签系统规则
- 必须继承原始标签
- 可添加最多2个新标签（需符合领域术语）
- 推荐采用"领域-子领域-特性"三级标签体系

### 过滤机制
1. 排除以下问题类型:
   - 文本中无明确答案的
   - 涉及元信息(如"本章节")
   - 答案过于明显或琐碎的
2. 语义去重:
   - 使用嵌入向量确保问题相似度<0.7
   - 相同概念不同问法视为有效

## 输出规范
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

## 最终指令
请严格按以下步骤执行：
1. 分析文本内容，识别关键信息点
2. 按照指定风格和受众重构文本
3. 生成候选问题池（约 ${number * 2} 个）
4. 进行质量过滤和语义去重
5. 输出最优 ${number} 个问题
6. 确保 100% 符合 JSON Schema
7. 输出格式必须严格遵循示例 不要添加任何额外文本或注释
`;
}

// 计算最佳问题数量
function calculateOptimalQuestionCount(text: string): number {
    const baseCount = Math.floor(text.length / 240);
    const conceptDensity = (text.match(/\b[A-Z][a-z]+[A-Z][a-z]+\b/g) || []).length;
    return Math.min(20, Math.max(3, baseCount + Math.floor(conceptDensity / 2)));
}
