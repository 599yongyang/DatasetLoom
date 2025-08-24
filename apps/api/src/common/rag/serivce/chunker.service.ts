import { Injectable, Logger } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub';
import { RecursiveCharacterTextSplitter, MarkdownTextSplitter } from '@langchain/textsplitters';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { CleanService } from '@/common/rag/serivce/clean.service';

export interface LoaderOptions {
    splitPages?: boolean; // 用于 PDF 分页
    splitChapters?: boolean; // 用于 EPUB 章节分割
    encoding?: string; // 文件编码
    [key: string]: any;
}

// 默认配置
const DEFAULT_CHUNK_SIZE = 3000;
const DEFAULT_CHUNK_OVERLAP = 150;
const DEFAULT_CHUNK_SEPARATORS = ['\n\n', '\n', ' ', '　'];

export interface ChunkOptions {
    chunkSize?: number;
    chunkOverlap?: number;
    separators?: string[];
}

export type ChunkStrategy = 'auto' | 'page' | 'chapter' | string;

type ChunkerFunction = (content: string, options: Required<ChunkOptions>) => Promise<Document[]>;
type LoaderFactory = (filePath: string, options?: LoaderOptions) => any;

// 支持的文件类型枚举
export enum SupportedFileType {
    TXT = '.txt',
    MD = '.md',
    MARKDOWN = '.markdown',
    PDF = '.pdf',
    DOCX = '.docx',
    DOC = '.doc',
    EPUB = '.epub',
    CSV = '.csv'
}

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
    [SupportedFileType.MD]: markdownChunker,
    [SupportedFileType.MARKDOWN]: markdownChunker
};

// 定义支持的文件类型和对应的加载器
const loaderMap: Record<string, LoaderFactory> = {
    [SupportedFileType.TXT]: (filePath) => new TextLoader(filePath),
    [SupportedFileType.MD]: (filePath) => new TextLoader(filePath),
    [SupportedFileType.MARKDOWN]: (filePath) => new TextLoader(filePath),
    [SupportedFileType.PDF]: (filePath, options = {}) => new PDFLoader(filePath, {
        splitPages: options.splitPages !== false, // 默认分页
        parsedItemSeparator: ' '
    }),
    [SupportedFileType.DOCX]: (filePath) => new DocxLoader(filePath),
    [SupportedFileType.DOC]: (filePath) => new DocxLoader(filePath, { type: 'doc' }),
    [SupportedFileType.EPUB]: (filePath, options = {}) => new EPubLoader(filePath, {
        splitChapters: options.splitChapters !== false // 默认不分章节
    }),
    [SupportedFileType.CSV]: (filePath) => new CSVLoader(filePath)
};

@Injectable()
export class ChunkerService {
    private readonly logger = new Logger(ChunkerService.name);


    constructor(private readonly cleanService: CleanService) {
    }

    /**
     * 文档分块处理主函数
     * @param filePath 文件路径
     * @param cleanRules 清洗规则
     * @param strategy 分块策略 ('auto', 'page', 'chapter' 或其他自定义策略)
     * @param options 分块选项
     * @param loaderOptions 加载器选项
     * @returns 分块后的Document数组
     */
    async chunker(
        filePath: string,
        cleanRules: string[],
        strategy: ChunkStrategy = 'auto',
        options: ChunkOptions = {},
        loaderOptions: LoaderOptions = {}
    ): Promise<Document[]> {


        try {
            this.logger.log({ message: 'Starting document chunking', filePath, strategy, options });

            // 合并用户传入的 chunk 参数和默认值
            const resolvedOptions: Required<ChunkOptions> = {
                chunkSize: options.chunkSize ?? DEFAULT_CHUNK_SIZE,
                chunkOverlap: options.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP,
                separators: options.separators ?? DEFAULT_CHUNK_SEPARATORS
            };

            // 加载文档
            const docs = await this.loader(filePath, strategy, loaderOptions);

            if (docs.length === 0) {
                this.logger.warn(`No content loaded from ${filePath}`);
                return [];
            }

            // 合并所有文档内容
            const allContent = docs.map(doc => doc.pageContent).join('\n\n');

            let processedContent = allContent;
            if (cleanRules.length > 0) {
                const cleanResult = await this.cleanService.cleanText(allContent, cleanRules);
                processedContent = cleanResult.cleaned;
            }
            // 获取文件扩展名并选择合适分块函数
            const ext = this.getFileExtension(filePath);
            const chunkerFn = chunkerMap[ext] || defaultChunker;

            // 执行分块
            const chunks = await chunkerFn(processedContent, resolvedOptions);

            this.logger.log({
                message: 'Document chunking completed',
                filePath,
                fileExtension: ext,
                chunkCount: chunks.length
            });

            return chunks;
        } catch (error) {
            this.logger.error(`Error chunking document ${filePath}:`, error.stack);

            // 提供更具体的错误信息
            if (error.code === 'ENOENT') {
                throw new Error(`File not found: ${filePath}`);
            } else if (error instanceof SyntaxError) {
                throw new Error(`File format error in ${filePath}`);
            }
            throw new Error(`Failed to chunk document: ${error.message}`);
        }
    }

    /**
     * 加载文档内容
     * @param filePath 文件路径
     * @param strategy 分块策略
     * @param loaderOptions 加载器选项
     * @returns Document数组
     */
    async loader(
        filePath: string,
        strategy: ChunkStrategy,
        loaderOptions: LoaderOptions = {}
    ): Promise<Document[]> {
        const ext = this.getFileExtension(filePath);
        const createLoader = loaderMap[ext];

        if (!createLoader) {
            const error = new Error(`Unsupported file type: ${ext}`);
            this.logger.error(error.message);
            throw error;
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
            this.logger.log(`Loaded ${docs.length} document(s) from ${filePath}`);
            return docs;
        } catch (error) {
            this.logger.error(`Error loading document from ${filePath}:`, error.stack);
            throw new Error(`Failed to load document: ${error.message}`);
        }
    }

    /**
     * 获取文件扩展名
     * @param filePath 文件路径
     * @returns 文件扩展名（小写）
     */
    private getFileExtension(filePath: string): string {
        return filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
    }

}
