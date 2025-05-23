export interface QuestionPromptOptions {
    text: string;
    tags: string;
    number?: number;
    difficulty?: string | 'easy' | 'medium' | 'hard';
    audience?: string;
    genre?: string;
    language?: 'zh' | 'en';
    globalPrompt?: string;
    questionPrompt?: string;
}

export interface AnswerPromptOptions {
    context: string; // 文本块内容
    question: string; // 待回答的问题
    language?: 'zh' | 'en'; // 输出语言
    detailLevel?: 'concise' | 'normal' | 'detailed'; // 详细程度
    citation?: boolean; // 是否需要引用原文
    answerStyle?: 'direct' | 'reasoning' | 'stepwise' | 'explanatory'; // 答案风格
    tags?: string[]; // 标签体系辅助理解
    globalPrompt?: string;
    answerPrompt?: string;
}

export interface LabelPromptOptions {
    text: string;
    language?: 'zh' | 'en';
    globalPrompt?: string;
    domainTreePrompt?: string;
}

export interface NewAnswerPromptOptions {
    question: string;
    answer: string;
    cot: string;
    advice: string;
}

export interface OptimizeCotPromptOptions {
    originalQuestion: string;
    answer: string;
    originalCot: string;
}
