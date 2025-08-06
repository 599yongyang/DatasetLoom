import {BaseParser} from './base-parser';
import type {ParseInput} from './types';
import {TextLoader} from 'langchain/document_loaders/fs/text';
import {PDFLoader} from '@langchain/community/document_loaders/fs/pdf';
import {DocxLoader} from '@langchain/community/document_loaders/fs/docx';
import {EPubLoader} from '@langchain/community/document_loaders/fs/epub';

export class NativeParser extends BaseParser {
    async parse(input: ParseInput): Promise<string> {
        this.validateInput(input, ['filePath']);

        const ext = this.getFileExtension(input.filePath!);
        const createLoader = this.getLoaderFactory(ext);

        if (!createLoader) {
            throw new Error(`Unsupported file type: ${ext}`);
        }

        const options = this.getLoaderOptions(ext);
        const loader = createLoader(input.filePath!, options);
        const docs = await loader.load();
        return docs.map((doc: any) => doc.pageContent).join();
    }

    private getLoaderFactory(ext: string): Function | undefined {
        return this.loaderMap[ext];
    }

    private getLoaderOptions(ext: string): any {
        const options: LoaderOptions = {
            splitPages: false
        };

        if (ext === '.pdf') {
            options.splitPages = false;
        }

        return options;
    }

    private get loaderMap(): Record<string, Function> {
        return {
            'txt': (filePath: string) => new TextLoader(filePath),
            'md': (filePath: string) => new TextLoader(filePath),
            'pdf': (filePath: string, options: LoaderOptions = {}) =>
                new PDFLoader(filePath, {splitPages: options.splitPages}),
            'docx': (path: string) => new DocxLoader(path),
            'doc': (path: string) => new DocxLoader(path, {type: 'doc'}),
            'epub': (path: string) => new EPubLoader(path, {splitChapters: false})
        };
    }
}

interface LoaderOptions {
    splitPages?: boolean;

    [key: string]: any;
}
