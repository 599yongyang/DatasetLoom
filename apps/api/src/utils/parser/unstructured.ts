import { BaseParser } from './base-parser';
import type { ParseInput } from './types';
import { UnstructuredLoader } from '@langchain/community/document_loaders/fs/unstructured';

export class UnstructuredParser extends BaseParser {
    async parse(input: ParseInput): Promise<string> {
        this.validateConfig(['apiUrl']);
        this.validateInput(input, ['filePath']);

        try {
            const loader = new UnstructuredLoader(input.filePath!, {
                apiUrl: this.config.apiUrl!,
                apiKey: this.config.apiKey || undefined
            });
            const docs = await loader.load();
            return docs.map(doc => doc.pageContent).join();
        } catch (error: any) {
            this.handleError(error, 'UnstructuredParser');
        }
    }
}
