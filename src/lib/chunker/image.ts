import { Document } from 'llamaindex';
import { ImageReader } from '@llamaindex/readers/image';

export async function chunkImage(filePath: string) {
    const reader = new ImageReader();
    let documents: Document[];
    try {
        documents = await reader.loadData(filePath);
    } catch (error) {
        console.error('Failed to load file:', error);
        throw new Error(`Could not read file at path: ${filePath}`);
    }
    return documents;
}
