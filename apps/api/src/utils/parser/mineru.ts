import axios from 'axios';
import { BaseParser } from './base-parser';
import type { ParseInput } from './types';

export class MineruParser extends BaseParser {
    async parse(input: ParseInput): Promise<string> {
        this.validateConfig(['apiKey', 'apiUrl']);
        this.validateInput(input, ['filePath', 'fileName']);

        if (!this.config.apiUrl) {
            throw new Error('MineruParser 配置中缺少 apiUrl');
        }

        try {
            // 获取上传链接
            const urlResponse = await this.getBatchFileUrls([{ name: input.fileName!, is_ocr: true }]);
            const batchId = urlResponse.data.batch_id;
            const uploadUrl = urlResponse.data.file_urls[0];

            // 上传文件
            await this.uploadFile(uploadUrl, input.file as File);

            // 轮询任务直到完成
            const result = await this.pollBatchTaskUntilComplete(batchId);
            return result.data.extract_result[0].content;
        } catch (error: any) {
            this.handleError(error, 'MineruParser');
        }
    }

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
        return response;
    }

    private async uploadFile(uploadUrl: string, file: File) {
        await axios.put(uploadUrl, file, {
            headers: {
                'Content-Type': file.type,
                Authorization: `Bearer ${this.config.apiKey}`
            }
        });
    }

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

    private async getBatchTaskStatus(batchId: string) {
        const url = `${this.config.apiUrl}/extract-results/batch/${batchId}`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${this.config.apiKey}`
            }
        });
        return response;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
