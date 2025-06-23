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
    const sanitizedGlobalPrompt = globalPrompt ? `\n## 全局规则\n${globalPrompt}` : '';
    const sanitizedQuestionPrompt = questionPrompt ? `\n## 问题生成专项规则\n${questionPrompt}` : '';
    const outputLanguage = languageMap[language] || '中文';

    // 动态调整候选问题池大小
    const candidatePoolSize = Math.max(number * 1.5, number + 5);

    return `
# 角色定位
你是一位专业的知识工程师，专精于从技术文档中提取核心概念并生成高质量的训练问答对。输出语言：${outputLanguage}${sanitizedGlobalPrompt}

## 文本分析参数
- 内容长度：${text.length} 字符
- 领域标签：[${tags || '待识别'}]  
- 目标问题数：${number} 个
- 难度配置：${difficulty} - ${difficultyMap[difficulty]?.depth}
- 类型分布：${difficultyMap[difficulty]?.ratio}
- 风格适配：${currentStyle}
- 目标受众：${audience}

## 生成策略${sanitizedQuestionPrompt}

### 1. 信息提取优先级
**高优先级概念**：定义、原理、架构、流程、关键数据
**中优先级概念**：特性、优势、应用场景、对比分析  
**低优先级概念**：举例说明、背景信息、补充细节

### 2. 问题类型分布控制
按${difficultyMap[difficulty]?.ratio}比例生成：
- **事实询问型**：核心概念的定义、组成要素、基本特征
- **逻辑推理型**：因果关系、工作原理、影响机制
- **应用分析型**：使用场景、解决方案、实践建议

### 3. 质量控制标准
**必须满足**：
- 答案在原文中有明确依据
- 问题表述清晰无歧义
- 避免是非题和过于简单的选择
- 专业术语使用准确

**避免生成**：
- 需要额外背景知识才能回答
- 涉及具体数字但原文未明确给出
- 过于宽泛或开放式的主观问题
- 重复概念的不同表述

## 输出要求

### JSON 格式规范
\`\`\`json
[
  {
    "question": "什么是分布式训练中的数据并行？",
    "label": ["分布式训练", "数据并行", "深度学习"],
    "difficulty": "factual",
    "answer_hint": "数据分割到多个设备上并行处理"
  }
]
\`\`\`

### 标签规范
- 保留原有标签：[${tags}]
- 新增标签不超过2个，采用"领域-技术-特性"结构
- 优先使用行业标准术语

## 执行流程

### 待分析文本
\`\`\`
${text}
\`\`\`

### 生成步骤
1. **内容解析**：识别关键概念和信息层次
2. **候选生成**：创建${candidatePoolSize}个候选问题
3. **质量筛选**：应用过滤标准和去重机制
4. **最终输出**：精选${number}个最佳问答对

**重要**：仅输出符合JSON Schema的结果，不添加解释文字。
`;
}

/**
 * 问题数量计算算法
 */
function calculateOptimalQuestionCount(text: string): number {
    const textLength = text.length;

    // 基础问题数（基于文本长度）
    let baseCount = Math.floor(textLength / 400); // 调整基础比例

    // 概念密度分析（技术术语、专有名词）
    const technicalTerms = text.match(/[A-Z]{2,}|[A-Za-z]+[A-Z][a-z]+|\b[A-Z][a-z]*[A-Z][a-z]*\b/g) || [];
    const conceptBonus = Math.floor(technicalTerms.length / 8); // 降低权重

    // 结构化内容检测（列表、步骤等）
    const structurePatterns = text.match(/[1-9]\.|[•·▪▫◦‣⁃]\s|第[一二三四五六七八九十]\w/g) || [];
    const structureBonus = Math.floor(structurePatterns.length / 5);

    // 信息密度评估
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 10);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    const densityFactor = avgSentenceLength > 50 ? 1.2 : avgSentenceLength < 20 ? 0.8 : 1;

    const finalCount = Math.floor((baseCount + conceptBonus + structureBonus) * densityFactor);

    // 合理范围限制
    return Math.min(25, Math.max(2, finalCount));
}
