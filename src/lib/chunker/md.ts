import { Document, MarkdownNodeParser, SentenceSplitter } from 'llamaindex';
import { CSVReader } from '@llamaindex/readers/csv';
import { DocxReader } from '@llamaindex/readers/docx';
import { HTMLReader } from '@llamaindex/readers/html';
import { ImageReader } from '@llamaindex/readers/image';
import { JSONReader } from '@llamaindex/readers/json';
import { MarkdownReader } from '@llamaindex/readers/markdown';
import { ObsidianReader } from '@llamaindex/readers/obsidian';
import { PDFReader } from '@llamaindex/readers/pdf';
import { TextFileReader } from '@llamaindex/readers/text';

// 定义类型
interface Node {
    text: string;
    metadata: Record<string, any>;
}

export async function chunkMD(filePath: string) {
    const reader = new MarkdownReader();
    const markdownNodeParser = new MarkdownNodeParser();

    let documents: Document[];
    try {
        documents = await reader.loadData(filePath);
    } catch (error) {
        console.error('Failed to load file:', error);
        throw new Error(`Could not read file at path: ${filePath}`);
    }

    const parsedDocuments = markdownNodeParser.getNodesFromDocuments(documents);

    return optimizeReadmeNodes(parsedDocuments);
}

function optimizeReadmeNodes(nodes: Node[]): Node[] {
    return mergeNodesByHeaderLevel(
        nodes.map(node => ({
            ...node,
            text: extractImageLinks(removeRedundantSeparators(cleanHtml(node.text)))
        }))
    );
}

function cleanHtml(text: string): string {
    return text.replace(/<[^>]+>/g, '').replace(/\r?\n/g, '\n');
}

function removeRedundantSeparators(text: string): string {
    return text.replace(/-{3,}/g, '---'); // 标准化分隔线
}

function extractImageLinks(text: string): string {
    return text.replace(/!\[[^\]]*\]\(([^)]+)\)/g, '[图片] $1');
}

function mergeNodesByHeaderLevel(nodes: Node[]): Node[] {
    const mergedNodes: Node[] = [];
    let currentNode: Node | null = null;

    for (const node of nodes) {
        const headerLevel = getHeaderLevel(node.metadata);

        if (headerLevel === 3) {
            if (currentNode) mergedNodes.push(currentNode);
            currentNode = { ...node };
        } else if (currentNode) {
            currentNode.text += `\n\n${node.text}`;
            if (headerLevel >= 3) {
                currentNode.metadata = { ...currentNode.metadata, ...node.metadata };
            }
        } else {
            mergedNodes.push(node);
        }
    }

    if (currentNode) mergedNodes.push(currentNode);
    return mergedNodes;
}

function getHeaderLevel(metadata: Record<string, any>): number {
    if (metadata.Header_1) return 1;
    if (metadata.Header_2) return 2;
    if (metadata.Header_3) return 3;
    if (metadata.Header_4) return 4;
    return 0;
}
