import axios from 'axios';
import type { ParseInput, Parser } from '@/lib/parser/types';
import type { ParserConfig } from '@prisma/client';

export class JinaAiParser implements Parser {
    private config: ParserConfig;
    private returnFormat: string;

    constructor(config: ParserConfig) {
        this.config = config;
        this.returnFormat = 'markdown';
    }

    async parse(input: ParseInput): Promise<string> {
        // 参数校验
        if (!this.config.apiKey || !this.config.apiUrl) {
            throw new Error('JinaParser 需要有效的认证 Token');
        }
        console.log('JinaParser', input);
        if (!input.url && !input.pdf) {
            throw new Error('需要提供有效的 URL 或 Base64 编码的 PDF 数据');
        }
        try {
            const response = await axios.post(
                this.config.apiUrl,
                {
                    url: input.url,
                    pdf: input.pdf
                },
                {
                    headers: {
                        Authorization: this.config.apiKey,
                        'X-Return-Format': this.returnFormat
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || '未知错误';
            console.error(`Jina Parser 请求失败: ${errorMessage}`);
            throw new Error(`Jina Parser 请求失败: ${errorMessage}`);
        }
    }
}
