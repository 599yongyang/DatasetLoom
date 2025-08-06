import axios from 'axios';
import { BaseParser } from './base-parser';
import type { ParseInput } from './types';

export class JinaAiParser extends BaseParser {
    async parse(input: ParseInput): Promise<string> {
        this.validateConfig(['apiKey', 'apiUrl']);

        if (!input.url && !input.pdf) {
            throw new Error('需要提供有效的 URL 或 Base64 编码的 PDF 数据');
        }

        try {
            const response = await axios.post(
                this.config.apiUrl!,
                {
                    url: input.url,
                    pdf: input.pdf
                },
                {
                    headers: {
                        Authorization: this.config.apiKey!,
                        'X-Return-Format': this.returnFormat
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            this.handleError(error, 'Jina Parser');
        }
    }
}
