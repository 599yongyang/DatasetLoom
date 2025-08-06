import type { Parser } from './types';
import type { ParserConfig } from '@prisma/client';
import { JinaAiParser } from './jina';
import { FireCrawlParser } from './firecrawl';
import { ChunkrParser } from './chunkr';
import { UnstructuredParser } from './unstructured';
import { NativeParser } from './native';
import { MineruParser } from './mineru';

export class ParserFactory {
    static createParser(config: ParserConfig): Parser {
        const serviceId = config.serviceId.toLowerCase();

        switch (serviceId) {
            case 'native':
                return new NativeParser(config);
            case 'jina':
                return new JinaAiParser(config);
            case 'mineru':
                return new MineruParser(config);
            case 'firecrawl':
                return new FireCrawlParser(config);
            case 'chunkr':
                return new ChunkrParser(config);
            case 'unstructured':
                return new UnstructuredParser(config);
            default:
                throw new Error(`不支持的解析器类型: ${config.serviceId}`);
        }
    }
}
