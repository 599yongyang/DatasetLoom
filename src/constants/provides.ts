export const DEFAULT_PROVIDERS = [
    {
        id: 'ollama',
        name: 'Ollama',
        apiUrl: 'http://127.0.0.1:11434/api',
        icon: 'ollama',
        interfaceType: 'ollama'
    },
    {
        id: 'vllm',
        name: 'VLLM',
        apiUrl: 'http://localhost:8000',
        icon: 'vllm',
        interfaceType: 'openAICompatible'
    },
    {
        id: 'lmstudio',
        name: 'LmStudio',
        apiUrl: 'http://localhost:1234/v1',
        icon: 'lmstudio',
        interfaceType: 'openAICompatible'
    },
    {
        id: 'deepseek',
        name: 'DeepSeek',
        apiUrl: 'https://api.deepseek.com/v1/',
        icon: 'deepseek',
        interfaceType: 'deepseek'
    },
    {
        id: 'openai',
        name: 'OpenAI',
        apiUrl: 'https://api.openai.com/v1/',
        icon: 'openai',
        interfaceType: 'openai'
    },
    {
        id: 'google',
        name: 'Google AI',
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta/',
        icon: 'google',
        interfaceType: 'google'
    },
    {
        id: 'anthropic',
        name: 'Anthropic',
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta/',
        icon: 'anthropic',
        interfaceType: 'anthropic'
    },
    {
        id: 'siliconcloud',
        name: '硅基流动',
        apiUrl: 'https://api.ap.siliconflow.com/v1/',
        icon: 'siliconcloud',
        interfaceType: 'openAICompatible'
    },
    {
        id: 'zhipu',
        name: '智谱AI',
        apiUrl: 'https://open.bigmodel.cn/api/paas/v4/',
        icon: 'zhipu',
        interfaceType: 'zhipu'
    },
    {
        id: 'Doubao',
        name: '火山引擎(豆包)',
        apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/',
        icon: 'doubao',
        interfaceType: 'openAICompatible'
    },
    {
        id: 'groq',
        name: 'Groq',
        apiUrl: 'https://api.groq.com/openai',
        icon: 'groq',
        interfaceType: 'openAICompatible'
    },
    {
        id: 'grok',
        name: 'Grok',
        apiUrl: 'https://api.x.ai',
        icon: 'grok',
        interfaceType: 'openAICompatible'
    },
    {
        id: 'openRouter',
        name: 'OpenRouter',
        apiUrl: 'https://openrouter.ai/api/v1/',
        icon: 'openRouter',
        interfaceType: 'openRouter'
    }
];
