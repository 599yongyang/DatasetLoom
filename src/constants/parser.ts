import { Brain, ExternalLink, Globe, Zap } from 'lucide-react';
import { Icons } from '@/components/icons';

export const PARSER_SERVICE_LIST = [
    {
        id: 'unstructured',
        name: 'Unstructured',
        description: '专业文档解析服务，支持复杂布局和表格提取',
        icon: Icons.unstructured,
        category: 'document',
        supportedInputs: ['local', 'webFile'],
        supportedTypes: ['pdf', 'docx', 'pptx', 'xlsx'],
        baseUrl: 'https://api.unstructured.io',
        features: ['复杂布局', '表格提取', '元数据保留', '多格式支持'],
        docsLink: 'https://unstructured.io/docs'
    },
    // {
    //     id: "chunkr",
    //     name: "Chunkr",
    //     description: "将复杂文档转换为 RAG/LLM 就绪数据的视觉基础设施服务",
    //     icon: Brain,
    //     category: "document",
    //     supportedInputs: ["local", "webFile"],
    //     supportedTypes: ["pdf", "docx", "doc", "pptx", "ppt", "xlsx", 'xls', 'jpeg', 'jpg', 'png'],
    //     baseUrl: "https://www.chunkr.ai",
    //     features: ["高精度解析", "结构化输出", "多语言支持", "PDF专用"],
    //     docsLink: "https://docs.chunkr.ai"
    // },
    // {
    //     id: "mineru",
    //     name: "MinerU",
    //     description: "高质量数据提取工具",
    //     icon: Icons.mu,
    //     category: "document",
    //     supportedInputs: ["local", "webFile"],
    //     supportedTypes: ["pdf", "docx", "doc", "pptx", "ppt", "xlsx", 'xls', 'jpeg', 'jpg', 'png'],
    //     baseUrl: "https://mineru.net/api/v4/",
    //     features: ["高精度解析", "结构化输出", "多语言支持", "PDF专用"],
    //     docsLink: "https://mineru.net/apiManage"
    // },
    {
        id: 'Jina',
        name: 'Jina Reader',
        description: '专业的网页内容提取和清理服务',
        icon: Icons.jina,
        category: 'web',
        supportedInputs: ['local', 'webUrl', 'webFile'],
        supportedTypes: ['pdf'],
        baseUrl: 'https://r.jina.ai',
        features: ['智能清理', '保留结构', '去除广告', '多语言支持'],
        docsLink: 'https://jina.ai/reader'
    },
    {
        id: 'FireCrawl',
        name: 'FireCrawl',
        description: '强大的网站爬取和内容提取平台',
        icon: Icons.firecrawl,
        category: 'web',
        supportedInputs: ['webUrl'],
        baseUrl: 'https://api.firecrawl.dev',
        features: ['深度爬取', 'JavaScript渲染', '反反爬', '结构化数据'],
        docsLink: 'https://firecrawl.dev/docs'
    }
];
