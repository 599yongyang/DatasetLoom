import type { ParseInput, Parser } from '@/lib/parser/types';
import type { ParserConfig } from '@prisma/client';
import { UnstructuredLoader } from '@langchain/community/document_loaders/fs/unstructured';

export class UnstructuredParser implements Parser {
    private config: ParserConfig;
    private returnFormat: string;

    constructor(config: ParserConfig) {
        this.config = config;
        this.returnFormat = 'markdown';
    }

    async parse(input: ParseInput): Promise<string> {
        try {
            const loader = new UnstructuredLoader(input.filePath!, {
                apiUrl: this.config.apiUrl,
                apiKey: this.config.apiKey
            });
            const docs = await loader.load();
            return docs.map(doc => doc.pageContent).join();
        } catch (e) {
            console.log(e);
            throw new Error(`UnstructuredParser error: ${e}`);
        }
    }
}
