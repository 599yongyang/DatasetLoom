import { TextLoader } from 'langchain/document_loaders/fs/text';
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub';
import { RecursiveCharacterTextSplitter, MarkdownTextSplitter } from '@langchain/textsplitters';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { Document } from '@langchain/core/documents';

// 默认配置
const DEFAULT_CHUNK_SIZE = 3000;
const DEFAULT_CHUNK_OVERLAP = 150;
const DEFAULT_CHUNK_SEPARATORS = ['\n\n', '\n', ' ', '　'];

interface ChunkOptions {
    chunkSize?: number;
    chunkOverlap?: number;
    separators?: string[];
}

type ChunkerFunction = (content: string, options: Required<ChunkOptions>) => Promise<Document[]>;

// Markdown 分块策略
async function markdownChunker(content: string, options: Required<ChunkOptions>): Promise<Document[]> {
    const splitter = MarkdownTextSplitter.fromLanguage('markdown', {
        chunkSize: options.chunkSize,
        chunkOverlap: options.chunkOverlap,
        separators: options.separators
    });
    return await splitter.createDocuments([content]);
}

// 默认通用分块策略（适用于 txt/pdf/docx 等）
async function defaultChunker(content: string, options: Required<ChunkOptions>): Promise<Document[]> {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: options.chunkSize,
        chunkOverlap: options.chunkOverlap,
        separators: options.separators
    });
    return await splitter.createDocuments([content]);
}

// 注册特殊格式的分块策略
const chunkerMap: Record<string, ChunkerFunction> = {
    '.md': markdownChunker
};

export async function chunker(filePath: string, strategy: string, options: ChunkOptions = {}) {
    if (strategy === 'auto') {
        options = {};
    }
    // 合并用户传入的 chunk 参数和默认值
    const resolvedOptions: Required<ChunkOptions> = {
        chunkSize: options.chunkSize ?? DEFAULT_CHUNK_SIZE,
        chunkOverlap: options.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP,
        separators: options.separators ?? DEFAULT_CHUNK_SEPARATORS
    };
    const docs = await loader(filePath, strategy);
    if (strategy === 'page') {
        console.log(docs, docs.length, `loaded`);
        return docs;
    }
    const allContent = docs.map(doc => doc.pageContent).join();
    const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
    // 获取对应格式的分块函数
    const chunkerFn = chunkerMap[ext] || defaultChunker;
    // 执行分块
    const chunks = await chunkerFn(allContent, resolvedOptions);
    console.log(chunks, chunks.length, `${ext.toUpperCase()} chunked`);
    return chunks;
}

// 定义 loader 工厂函数的类型
type LoaderFactory = (filePath: string, options?: LoaderOptions) => any;

interface LoaderOptions {
    splitPages?: boolean; // 用于 PDF 分页
    [key: string]: any;
}

const loaderMap: Record<string, LoaderFactory> = {
    '.md': filePath => new TextLoader(filePath),
    '.pdf': (filePath: string, options: LoaderOptions = {}) =>
        new PDFLoader(filePath, { splitPages: options.splitPages }),
    '.docx': path => new DocxLoader(path),
    '.doc': path => new DocxLoader(path, { type: 'doc' }),
    '.epub': path => new EPubLoader(path, { splitChapters: false })
};

async function loader(filePath: string, strategy: string): Promise<Document[]> {
    const ext = filePath.slice(filePath.lastIndexOf('.'));
    const createLoader = loaderMap[ext];

    if (!createLoader) {
        throw new Error(`Unsupported file type: ${ext}`);
    }
    const options: LoaderOptions = {
        splitPages: strategy === 'page'
    };
    const loader = createLoader(filePath, options);
    return await loader.load();
}
