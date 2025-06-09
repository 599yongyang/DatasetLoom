import type { Parser } from './types';
import type { ParserConfig } from '@prisma/client';
import { JinaAiParser } from '@/lib/parser/jina';
import { FireCrawlParser } from '@/lib/parser/firecrawl';
import { ChunkrParser } from '@/lib/parser/chunkr';
import { UnstructuredParser } from '@/lib/parser/unstructured';
import { NativeParser } from '@/lib/parser/native';
import { MineruParser } from '@/lib/parser/mineru';

export function createParser(config: ParserConfig): Parser {
    switch (config.serviceId.toLowerCase()) {
        case 'native':
            return new NativeParser();
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
