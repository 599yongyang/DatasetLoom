import type { ParseInput, Parser } from '@/lib/parser/types';
import type { ParserConfig } from '@prisma/client';
import { FireCrawlLoader } from '@langchain/community/document_loaders/web/firecrawl';

export class FireCrawlParser implements Parser {
    private config: ParserConfig;
    private returnFormat: string;

    constructor(config: ParserConfig) {
        this.config = config;
        this.returnFormat = 'markdown';
    }

    async parse(input: ParseInput): Promise<string> {
        const loader = new FireCrawlLoader({
            url: input.url!,
            apiUrl: this.config.apiUrl,
            apiKey: this.config.apiKey,
            mode: 'scrape',
            params: {
                formats: [this.returnFormat]
            }
        });
        const docs = await loader.load();
        return docs.map(doc => doc.pageContent).join();
    }
}
