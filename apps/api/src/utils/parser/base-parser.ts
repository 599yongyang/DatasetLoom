import type { ParseInput, Parser } from './types';
import type { ParserConfig } from '@prisma/client';

export abstract class BaseParser implements Parser {
    protected config: ParserConfig;
    protected returnFormat: string;

    constructor(config: ParserConfig) {
        this.config = config;
        this.returnFormat = 'markdown';
    }

    abstract parse(input: ParseInput): Promise<string>;

    protected validateConfig(requiredFields: string[] = []): void {
        for (const field of requiredFields) {
            if (!this.config[field as keyof ParserConfig]) {
                throw new Error(`${this.constructor.name} 需要有效的 ${field}`);
            }
        }
    }

    protected validateInput(input: ParseInput, requiredFields: string[] = []): void {
        for (const field of requiredFields) {
            if (!input[field as keyof ParseInput]) {
                throw new Error(`${this.constructor.name} 需要有效的 ${field} 数据`);
            }
        }
    }

    protected handleError(error: any, parserName: string): never {
        const errorMessage = error.response?.data?.message || error.message || '未知错误';
        console.error(`${parserName} 请求失败: ${errorMessage}`);
        throw new Error(`${parserName} 请求失败: ${errorMessage}`);
    }
    protected getFileExtension(filename: string): string {
        return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
    }


}
