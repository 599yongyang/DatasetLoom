export const jsonExample: Record<string, any> = {
    alpaca: [
        {
            instruction: '人类指令（必填）',
            input: '人类输入（选填）',
            output: '模型回答（必填）',
            system: '系统提示词（选填）'
        }
    ],
    sharegpt: [
        {
            messages: [
                {
                    role: 'system',
                    content: '系统提示词（选填）'
                },
                {
                    role: 'user',
                    content: '人类指令'
                },
                {
                    role: 'assistant',
                    content: '模型回答'
                }
            ]
        }
    ]
};

export const jsonlExample: Record<string, any> = {
    alpaca: `{"instruction": "人类指令（必填）", "input": "人类输入（选填）", "output": "模型回答（必填）", "system": "系统提示词（选填）"}
{"instruction": "第二个指令", "input": "", "output": "第二个回答", "system": "系统提示词"}`,
    sharegpt: `{"messages": [{"role": "system", "content": "系统提示词（选填）"}, {"role": "user", "content": "人类指令"}, {"role": "assistant", "content": "模型回答"}]}
{"messages": [{"role": "user", "content": "第二个问题"}, {"role": "assistant", "content": "第二个回答"}]}`
};
