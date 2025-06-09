import axios from 'axios';
import type { ParseInput, Parser } from '@/lib/parser/types';
import type { ParserConfig } from '@prisma/client';

export class ChunkrParser implements Parser {
    private config: ParserConfig;
    private returnFormat: string;

    constructor(config: ParserConfig) {
        this.config = config;
        this.returnFormat = 'markdown';
    }

    async parse(input: ParseInput): Promise<string> {
        // 参数校验
        if (!this.config.apiKey) {
            throw new Error('ChunkrParser 需要有效的认证 Token');
        }

        if (!input.fileStringData || !input.fileName) {
            throw new Error('ChunkrParser 需要有效的文件数据');
        }

        try {
            const response = await axios.post(
                this.config.apiUrl + '/api/v1/task/parse',
                {
                    file: input.fileStringData,
                    file_name: input.fileName,
                    ocr_strategy: 'Auto'
                },
                {
                    headers: {
                        Authorization: this.config.apiKey
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || '未知错误';
            console.error(`Chunkr Parser 请求失败: ${errorMessage}`);
            throw new Error(`Chunkr Parser 请求失败: ${errorMessage}`);
        }
    }
}
