import { Document } from 'llamaindex';
import { HTMLReader } from '@llamaindex/readers/html';

export async function chunkHtml(filePath: string) {
    const reader = new HTMLReader();
    let documents: Document[];
    try {
        documents = await reader.loadData(filePath);
    } catch (error) {
        console.error('Failed to load file:', error);
        throw new Error(`Could not read file at path: ${filePath}`);
    }
    return documents;
}
