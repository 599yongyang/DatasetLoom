import axios from 'axios';
import { BaseParser } from './base-parser';
import type { ParseInput } from './types';

export class ChunkrParser extends BaseParser {
    async parse(input: ParseInput): Promise<string> {
        this.validateConfig(['apiKey', 'apiUrl']);
        this.validateInput(input, ['fileStringData', 'fileName']);

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
            this.handleError(error, 'Chunkr Parser');
        }
    }
}
