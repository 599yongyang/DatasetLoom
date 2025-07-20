export const txtExampleData: Record<string, any> = {
    raw: {
        alpaca: JSON.stringify(
            [
                {
                    question: '机器学习是什么？',
                    answers: '一种AI技术...',
                    model: 'deepseek-chat'
                },
                {
                    question: '机器学习是什么？',
                    answers: '一种通过数据训练模型...',
                    model: 'qwen3'
                }
            ],
            null,
            2
        ),
        sharegpt: JSON.stringify(
            [
                {
                    conversations: [
                        {
                            from: 'human',
                            value: '机器学习是什么?'
                        },
                        {
                            from: 'gpt',
                            value: '一种AI技术...'
                        }
                    ]
                },
                {
                    conversations: [
                        {
                            from: 'human',
                            value: '机器学习是什么？'
                        },
                        {
                            from: 'gpt',
                            value: '一种通过数据训练模型...'
                        }
                    ]
                }
            ],
            null,
            2
        )
    },
    sft: {
        alpaca: JSON.stringify(
            [
                {
                    instruction: '解释机器学习',
                    output: '一种通过数据训练模型的技术...'
                },
                {
                    instruction: '解释神经网络',
                    output: '由多层神经元组成的...'
                }
            ],
            null,
            2
        ),
        sharegpt: JSON.stringify(
            [
                {
                    conversations: [
                        {
                            from: 'human',
                            value: '机器学习是什么?'
                        },
                        {
                            from: 'gpt',
                            value: '一种AI技术...'
                        }
                    ]
                },
                {
                    conversations: [
                        {
                            from: 'human',
                            value: '解释神经网络'
                        },
                        {
                            from: 'gpt',
                            value: '由多层神经元组成的...'
                        }
                    ]
                }
            ],
            null,
            2
        )
    },
    dpo: {
        alpaca: JSON.stringify(
            [
                {
                    instruction: '解释神经网络',
                    chosen: '由多层神经元组成的...',
                    rejected: '类似大脑的结构...'
                },
                {
                    instruction: '解释机器学习',
                    chosen: '一种通过数据训练模型...',
                    rejected: '一种通过数据训练模型...'
                }
            ],
            null,
            2
        ),
        sharegpt: JSON.stringify(
            [
                {
                    conversations: [
                        {
                            from: 'human',
                            value: '解释神经网络'
                        },
                        {
                            from: 'gpt',
                            value: '由多层神经元组成的...'
                        }
                    ],
                    chosen: {
                        from: 'gpt',
                        value: '由多层神经元组成的...'
                    },
                    rejected: {
                        from: 'gpt',
                        value: '类似大脑的结构...'
                    }
                }
            ],
            null,
            2
        )
    }
};
