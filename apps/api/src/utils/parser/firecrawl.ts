import { BaseParser } from './base-parser';
import type { ParseInput } from './types';
import { FireCrawlLoader } from '@langchain/community/document_loaders/web/firecrawl';

export class FireCrawlParser extends BaseParser {
    async parse(input: ParseInput): Promise<string> {
        this.validateConfig(['apiUrl', 'apiKey']);
        this.validateInput(input, ['url']);

        try {
            const loader = new FireCrawlLoader({
                url: input.url!,
                apiUrl: this.config.apiUrl!,
                apiKey: this.config.apiKey!,
                mode: 'scrape',
                params: {
                    formats: [this.returnFormat]
                }
            });
            const docs = await loader.load();
            return docs.map(doc => doc.pageContent).join();
        } catch (error: any) {
            this.handleError(error, 'FireCrawlParser');
        }
    }
}
