export const DEFAULT_MODEL_SETTINGS = {
    temperature: 0.7,
    maxTokens: 8192
};
export const DEFAULT_PROVIDERS = [
    {
        name: 'Ollama',
        apiUrl: 'http://127.0.0.1:11434/api',
        icon: 'ollama',
        interfaceType: 'ollama'
    },
    {
        name: 'VLLM',
        apiUrl: 'http://localhost:8000',
        icon: 'vllm',
        interfaceType: 'openAICompatible'
    },
    {
        name: 'LmStudio',
        apiUrl: 'http://localhost:1234/v1',
        icon: 'lmstudio',
        interfaceType: 'openAICompatible'
    },
    {
        name: 'DeepSeek',
        apiUrl: 'https://api.deepseek.com/v1/',
        icon: 'deepseek',
        interfaceType: 'deepseek'
    },
    {
        name: 'OpenAI',
        apiUrl: 'https://api.openai.com/v1/',
        icon: 'openai',
        interfaceType: 'openai'
    },
    {
        name: 'Google AI',
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta/',
        icon: 'google',
        interfaceType: 'google'
    },
    {
        name: 'Anthropic',
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta/',
        icon: 'anthropic',
        interfaceType: 'anthropic'
    },
    {
        name: '硅基流动',
        apiUrl: 'https://api.ap.siliconflow.com/v1/',
        icon: 'siliconcloud',
        interfaceType: 'openAICompatible'
    },
    {
        name: '智谱AI',
        apiUrl: 'https://open.bigmodel.cn/api/paas/v4/',
        icon: 'zhipu',
        interfaceType: 'zhipu'
    },
    {
        name: '火山引擎(豆包)',
        apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/',
        icon: 'doubao',
        interfaceType: 'openAICompatible'
    },
    {
        name: 'Groq',
        apiUrl: 'https://api.groq.com/openai',
        icon: 'groq',
        interfaceType: 'openAICompatible'
    },
    {
        name: 'Grok',
        apiUrl: 'https://api.x.ai',
        icon: 'grok',
        interfaceType: 'openAICompatible'
    },
    {
        name: 'OpenRouter',
        apiUrl: 'https://openrouter.ai/api/v1/',
        icon: 'openRouter',
        interfaceType: 'openRouter'
    }
];
