import { Document } from 'llamaindex';
import { PDFReader } from '@llamaindex/readers/pdf';

export async function chunkPdf(filePath: string) {
    const reader = new PDFReader();
    let documents: Document[];
    try {
        documents = await reader.loadData(filePath);
    } catch (error) {
        console.error('Failed to load file:', error);
        throw new Error(`Could not read file at path: ${filePath}`);
    }
    return documents;
}
