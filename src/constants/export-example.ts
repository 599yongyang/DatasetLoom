export const exampleData: Record<string, any> = {
    raw: {
        json: JSON.stringify(
            [
                {
                    question: '机器学习是什么？',
                    answers: [
                        { text: '一种AI技术...', model: 'deepseek-chat' },
                        { text: '让计算机学习的学科...', model: 'qwen3' }
                    ]
                }
            ],
            null,
            2
        ),
        jsonl: `{"question":"...","answers":[...]}\n{"question":"...","answers":[...]}`
    },
    sft: {
        json: JSON.stringify(
            [
                {
                    instruction: '解释机器学习',
                    output: '一种通过数据训练模型的技术...',
                    confidence: 0.92
                }
            ],
            null,
            2
        ),
        jsonl: `{"instruction":"...","output":"..."}`
    },
    dpo: {
        json: JSON.stringify(
            [
                {
                    prompt: '解释神经网络',
                    chosen: '由多层神经元组成的...',
                    rejected: '类似大脑的结构...'
                }
            ],
            null,
            2
        ),
        jsonl: `{"prompt":"...","chosen":"...","rejected":"..."}`
    }
};
