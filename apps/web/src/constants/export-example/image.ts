export const imageExampleData: Record<string, any> = {
    raw: {
        sharegpt: JSON.stringify(
            [
                {
                    conversations: [
                        {
                            from: 'human',
                            value: '<image>图片中显示了哪些信息'
                        },
                        {
                            from: 'gpt',
                            value: '模型回答'
                        }
                    ],
                    images: ['图像路径']
                },
                {
                    conversations: [
                        {
                            from: 'human',
                            value: '<image>图片中显示了哪些信息'
                        },
                        {
                            from: 'gpt',
                            value: '模型回答'
                        }
                    ],
                    images: ['图像路径']
                }
            ],
            null,
            2
        )
    },
    sft: {
        sharegpt: JSON.stringify(
            [
                {
                    conversations: [
                        {
                            from: 'human',
                            value: '<image>图片中显示了哪些信息'
                        },
                        {
                            from: 'gpt',
                            value: '模型回答'
                        }
                    ],
                    images: ['图像路径']
                },
                {
                    conversations: [
                        {
                            from: 'human',
                            value: '<image>动物在做什么？'
                        },
                        {
                            from: 'gpt',
                            value: '模型回答'
                        }
                    ],
                    images: ['图像路径']
                }
            ],
            null,
            2
        )
    },
    dpo: {
        sharegpt: JSON.stringify(
            [
                {
                    conversations: [
                        {
                            from: 'human',
                            value: '描述这张图片'
                        },
                        {
                            from: 'gpt',
                            value: '一个戴眼镜看书的女人'
                        }
                    ],
                    chosen: {
                        from: 'gpt',
                        value: '一个戴眼镜看书的女人'
                    },
                    rejected: {
                        from: 'gpt',
                        value: '一个戴墨镜看杂志的女人'
                    },
                    images: ['图像路径']
                }
            ],
            null,
            2
        )
    }
};
