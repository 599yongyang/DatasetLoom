import { Injectable } from '@nestjs/common';
import { CleaningRuleEngine } from '@/utils/clean/rules';
import { CleaningResult } from '@/utils/clean/types';

@Injectable()
export class CleanService {
    private engine: CleaningRuleEngine;

    constructor() {
        this.engine = new CleaningRuleEngine();
    }

    async cleanText(text: string, rules: string[]): Promise<CleaningResult> {
        return this.engine.processText(text, rules);
    }

    async cleanBatch(texts: string[], rules: string[], batchSize: number = 10): Promise<CleaningResult[]> {
        const results: CleaningResult[] = [];

        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(text => this.cleanText(text, rules))
            );
            results.push(...batchResults);
        }

        return results;
    }

    async cleanWithProgress(
        texts: string[],
        rules: string[],
        onProgress?: (progress: number, total: number) => void
    ): Promise<CleaningResult[]> {
        const results: CleaningResult[] = [];
        const total = texts.length;

        for (let i = 0; i < texts.length; i++) {
            const result = await this.cleanText(texts[i], rules);
            results.push(result);
            if (onProgress) {
                onProgress(i + 1, total);
            }
        }

        return results;
    }
}
