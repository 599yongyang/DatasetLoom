import { Document } from 'llamaindex';
import { DocxReader } from '@llamaindex/readers/docx';

export async function chunkWord(filePath: string) {
    const reader = new DocxReader();
    let documents: Document[];
    try {
        documents = await reader.loadData(filePath);
    } catch (error) {
        console.error('Failed to load file:', error);
        throw new Error(`Could not read file at path: ${filePath}`);
    }
    return documents;
}
