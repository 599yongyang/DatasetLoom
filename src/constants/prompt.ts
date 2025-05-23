// 难度映射
export const difficultyMap: Record<string, { depth: string; ratio: string }> = {
    easy: { depth: '基础事实性', ratio: '7:2:1' },
    medium: { depth: '中等推理性', ratio: '5:3:2' },
    hard: { depth: '高阶开放性', ratio: '3:4:3' }
};

// 风格-受众映射示例
export const styleMap: Record<string, string> = {
    neutral: '中性',
    academic: '学术研究者',
    popular_science: '科普作者',
    conversational: '对话体（家长/学生）',
    story: '故事叙述者'
};

// 语言映射说明
export const languageMap: Record<string, string> = {
    zh: '中文',
    en: '英文'
};

// 答案风格映射
export const answerStyleMap = {
    direct: '直接给出问题的核心答案',
    reasoning: '提供完整的推理过程和依据',
    stepwise: '以分步形式逐步解答',
    explanatory: '提供背景说明与延伸解释'
};

// 答案详细程度描述
export const detailRuleMap = {
    concise: '1-2句话，只包含核心答案',
    normal: '3-5句话，包含主要证据与结论',
    detailed: '完整段落，包含背景、证据、推理与结论'
};
