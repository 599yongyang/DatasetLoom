import type { ParseInput, Parser } from '@/lib/parser/types';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub';

export class NativeParser implements Parser {
    async parse(input: ParseInput): Promise<string> {
        const ext = input.filePath!.slice(input.filePath!.lastIndexOf('.'));
        const createLoader = loaderMap[ext];

        if (!createLoader) {
            throw new Error(`Unsupported file type: ${ext}`);
        }
        const options: LoaderOptions = {
            splitPages: false
        };
        const loader = createLoader(input.filePath!, options);
        const docs = await loader.load();
        return docs.map((doc: any) => doc.pageContent).join();
    }
}

type LoaderFactory = (filePath: string, options?: LoaderOptions) => any;

interface LoaderOptions {
    splitPages?: boolean; // 用于 PDF 分页
    [key: string]: any;
}

const loaderMap: Record<string, LoaderFactory> = {
    '.txt': filePath => new TextLoader(filePath),
    '.md': filePath => new TextLoader(filePath),
    '.pdf': (filePath: string, options: LoaderOptions = {}) =>
        new PDFLoader(filePath, { splitPages: options.splitPages }),
    '.docx': path => new DocxLoader(path),
    '.doc': path => new DocxLoader(path, { type: 'doc' }),
    '.epub': path => new EPubLoader(path, { splitChapters: false })
};
