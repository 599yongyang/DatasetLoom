import axios from 'axios';
import type { ParseInput, Parser } from '@/lib/parser/types';
import type { ParserConfig } from '@prisma/client';

export class MineruParser implements Parser {
    private config: ParserConfig;
    private returnFormat: string;

    constructor(config: ParserConfig) {
        this.config = config;
        this.returnFormat = 'markdown';
    }

    async parse(input: ParseInput): Promise<string> {
        // 参数校验
        if (!this.config.apiKey) {
            throw new Error('MineruParser 需要有效的认证 Token');
        }

        if (!input.filePath || !input.fileName) {
            throw new Error('MineruParser 需要有效的文件数据');
        }

        const apiUrl = this.config.apiUrl;
        if (!apiUrl) {
            throw new Error('MineruParser 配置中缺少 apiUrl');
        }

        try {
            // 获取上传链接
            const urlResponse = await this.getBatchFileUrls([{ name: input.fileName, is_ocr: true }]);
            const batchId = urlResponse.data.batch_id;
            const uploadUrl = urlResponse.data.file_urls[0];

            console.log('上传文件到:', urlResponse);
            // 上传文件
            await this.uploadFile(uploadUrl, input.file);

            // 轮询任务直到完成
            const result = await this.pollBatchTaskUntilComplete(batchId);
            console.log('解析结果:', result.data);
            return result.data.extract_result[0].content; // 假设返回第一个文件的内容
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || '未知错误';
            console.error(`MineruParser 请求失败: ${errorMessage}`, {
                fileName: input.fileName,
                stack: error.stack
            });
            throw new Error(`MineruParser 请求失败: ${errorMessage}`);
        }
    }

    // 获取批量上传链接
    private async getBatchFileUrls(files: { name: string; is_ocr: boolean }[]) {
        const url = `${this.config.apiUrl}/file-urls/batch`;
        const response = await axios.post(
            url,
            { files },
            {
                headers: {
                    Authorization: `Bearer ${this.config.apiKey}`
                }
            }
        );
        return response.data;
    }

    // 上传文件到预签名 URL
    private async uploadFile(uploadUrl: string, file: File) {
        await axios.put(uploadUrl, file, {
            headers: {
                'Content-Type': file.type,
                Authorization: `Bearer ${this.config.apiKey}`
            }
        });
    }

    // 轮询任务状态
    private async pollBatchTaskUntilComplete(batchId: string, intervalMs = 3000, maxAttempts = 100) {
        let attempts = 0;

        while (attempts < maxAttempts) {
            const response = await this.getBatchTaskStatus(batchId);
            const results = response.data.extract_result;

            const allDone = results.every((result: any) => result.state === 'done' || result.state === 'failed');

            if (allDone) {
                return response;
            }

            attempts++;
            await this.delay(intervalMs);
        }

        throw new Error(`超过最大尝试次数 (${maxAttempts})，任务仍未完成`);
    }

    // 查询任务状态
    private async getBatchTaskStatus(batchId: string) {
        const url = `${this.config.apiUrl}/extract-results/batch/${batchId}`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${this.config.apiKey}`
            }
        });
        return response.data;
    }

    // 简单的 delay 工具函数
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
