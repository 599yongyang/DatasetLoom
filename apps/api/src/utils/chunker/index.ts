import {TextLoader} from 'langchain/document_loaders/fs/text';
import {EPubLoader} from '@langchain/community/document_loaders/fs/epub';
import {RecursiveCharacterTextSplitter, MarkdownTextSplitter} from '@langchain/textsplitters';
import {PDFLoader} from '@langchain/community/document_loaders/fs/pdf';
import {DocxLoader} from '@langchain/community/document_loaders/fs/docx';
import {Document} from '@langchain/core/documents';
import {PPTXLoader} from "@langchain/community/document_loaders/fs/pptx";
import {CSVLoader} from "@langchain/community/document_loaders/fs/csv";

// 默认配置
const DEFAULT_CHUNK_SIZE = 3000;
const DEFAULT_CHUNK_OVERLAP = 150;
const DEFAULT_CHUNK_SEPARATORS = ['\n\n', '\n', ' ', '　'];

export interface ChunkOptions {
    chunkSize?: number;
    chunkOverlap?: number;
    separators?: string[];
}

export interface LoaderOptions {
    splitPages?: boolean; // 用于 PDF 分页
    splitChapters?: boolean; // 用于 EPUB 章节分割
    encoding?: string; // 文件编码
    [key: string]: any;
}

export type ChunkStrategy = 'auto' | 'page' | 'chapter' | string;

type ChunkerFunction = (content: string, options: Required<ChunkOptions>) => Promise<Document[]>;
type LoaderFactory = (filePath: string, options?: LoaderOptions) => any;

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
    '.md': markdownChunker,
    '.markdown': markdownChunker,
};

// 定义支持的文件类型和对应的加载器
const loaderMap: Record<string, LoaderFactory> = {
    '.txt': (filePath) => new TextLoader(filePath),
    '.md': (filePath) => new TextLoader(filePath),
    '.markdown': (filePath) => new TextLoader(filePath),
    '.pdf': (filePath, options = {}) => new PDFLoader(filePath, {
        splitPages: options.splitPages !== false, // 默认分页
        parsedItemSeparator: " "
    }),
    '.docx': (filePath) => new DocxLoader(filePath),
    '.doc': (filePath) => new DocxLoader(filePath, {type: 'doc'}),
    '.epub': (filePath, options = {}) => new EPubLoader(filePath, {
        splitChapters: options.splitChapters !== false // 默认不分章节
    }),
    '.csv': (filePath) => new CSVLoader(filePath)
};

/**
 * 加载文档内容
 * @param filePath 文件路径
 * @param strategy 分块策略
 * @param loaderOptions 加载器选项
 * @returns Document数组
 */
async function loader(
    filePath: string,
    strategy: ChunkStrategy,
    loaderOptions: LoaderOptions = {}
): Promise<Document[]> {
    const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
    const createLoader = loaderMap[ext];

    if (!createLoader) {
        throw new Error(`Unsupported file type: ${ext}`);
    }

    // 根据策略设置默认选项
    const options: LoaderOptions = {
        splitPages: strategy === 'page',
        splitChapters: strategy === 'chapter',
        ...loaderOptions
    };

    try {
        const loaderInstance = createLoader(filePath, options);
        const docs = await loaderInstance.load();
        console.log(`Loaded ${docs.length} document(s) from ${filePath}`);
        return docs;
    } catch (error) {
        console.error(`Error loading document from ${filePath}:`, error);
        throw new Error(`Failed to load document: ${error.message}`);
    }
}

/**
 * 文档分块处理主函数
 * @param filePath 文件路径
 * @param strategy 分块策略 ('auto', 'page', 'chapter' 或其他自定义策略)
 * @param options 分块选项
 * @param loaderOptions 加载器选项
 * @returns 分块后的Document数组
 */
export async function chunker(
    filePath: string,
    strategy: ChunkStrategy = 'auto',
    options: ChunkOptions = {},
    loaderOptions: LoaderOptions = {}
): Promise<Document[]> {
    try {
        // 合并用户传入的 chunk 参数和默认值
        const resolvedOptions: Required<ChunkOptions> = {
            chunkSize: options.chunkSize ?? DEFAULT_CHUNK_SIZE,
            chunkOverlap: options.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP,
            separators: options.separators ?? DEFAULT_CHUNK_SEPARATORS
        };

        // 加载文档
        const docs = await loader(filePath, strategy, loaderOptions);

        if (docs.length === 0) {
            console.warn(`No content loaded from ${filePath}`);
            return [];
        }

        // 合并所有文档内容
        const allContent = docs.map(doc => doc.pageContent).join('\n\n');

        // 获取文件扩展名并选择合适分块函数
        const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
        const chunkerFn = chunkerMap[ext] || defaultChunker;

        // 执行分块
        const chunks = await chunkerFn(allContent, resolvedOptions);

        console.log(`Generated ${chunks.length} chunk(s) from ${filePath} (${ext.toUpperCase()})`);
        return chunks;
    } catch (error) {
        console.error(`Error chunking document ${filePath}:`, error);
        throw new Error(`Failed to chunk document: ${error.message}`);
    }
}

