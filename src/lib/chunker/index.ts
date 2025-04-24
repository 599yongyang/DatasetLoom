import { chunkMD } from '@/lib/chunker/md';
import { chunkWord } from '@/lib/chunker/word';
import { chunkHtml } from '@/lib/chunker/html';
import { chunkPdf } from '@/lib/chunker/pdf';
import { chunkImage } from '@/lib/chunker/image';

export async function chunker(filePath: string, fileExt: string, options: { maxChunkSize: number }): Promise<string[]> {
    const { maxChunkSize } = options;
    let docData: any[] = [];
    switch (fileExt.toLocaleLowerCase()) {
        case '.md':
            docData = await chunkMD(filePath);
            break;
        case '.docx':
            docData = await chunkWord(filePath);
            break;
        case '.html':
            docData = await chunkHtml(filePath);
            break;
        case '.pdf':
            docData = await chunkPdf(filePath);
            break;
        case '.png':
            docData = await chunkImage(filePath);
            break;
    }
    return createChunks(docData, maxChunkSize);
}

function createChunks(nodes: any[], maxChunkSize: number): string[] {
    const chunks: string[] = [];
    let i = 0;

    while (i < nodes.length) {
        let currentText = nodes[i]?.text || '';
        let currentLength = currentText.trim().length;

        if (currentLength > maxChunkSize) {
            chunks.push(currentText);
            i++;
            continue;
        }

        let combinedText = currentText;
        let endIndex = i;

        while (endIndex + 1 < nodes.length) {
            const nextText = nodes[endIndex + 1]?.text || '';
            const nextLength = nextText.length;

            if (combinedText.length + nextLength > maxChunkSize) break;

            combinedText += '\n\n' + nextText;
            endIndex++;
        }

        chunks.push(combinedText);
        i = endIndex + 1;
    }

    return chunks;
}
