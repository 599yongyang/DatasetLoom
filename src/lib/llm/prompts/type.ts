export interface QuestionPromptOptions {
    text: string;
    number?: number;
    globalPrompt?: string;
    questionPrompt?: string;
}

export interface AnswerPromptOptions {
    text: string;
    question: string;
    globalPrompt?: string;
    answerPrompt?: string;
}

export interface LabelPromptOptions {
    text: string;
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
