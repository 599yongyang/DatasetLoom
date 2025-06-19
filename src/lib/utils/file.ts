'use server';

import { createHash } from 'crypto';
import fs, { createReadStream } from 'fs';
import path from 'path';
import type { UIMessage } from 'ai';

export async function getFileMD5(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = createHash('md5');
        const stream = createReadStream(filePath);

        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

// 获取适合的数据存储目录
function getDbDirectory() {
    return process.env.LOCAL_DB_PATH || '/app/data/local-db';
}

// 项目根目录
const PROJECT_ROOT = getDbDirectory();

// 获取项目根目录
export async function getProjectRoot() {
    return PROJECT_ROOT;
}

// 确保目录存在
export async function ensureDir(dirPath: string) {
    try {
        await fs.promises.access(dirPath);
    } catch {
        await fs.promises.mkdir(dirPath, { recursive: true });
    }
}

const UPLOAD_DIR = path.join(process.cwd(), 'public');

export async function processMessages(messages: UIMessage[]): Promise<UIMessage[]> {
    return await Promise.all(messages.map(processMessage));
}

async function processMessage(message: UIMessage): Promise<UIMessage> {
    if (!message.experimental_attachments || message.experimental_attachments.length === 0) {
        return message;
    }

    try {
        const updatedAttachments = await Promise.all(
            message.experimental_attachments.map(async attachment => {
                if (!attachment.url || !attachment.contentType) {
                    return attachment;
                }

                try {
                    const filePath = path.join(UPLOAD_DIR, attachment.url);
                    const fileData = await fs.promises.readFile(filePath);
                    const base64 = fileData.toString('base64');

                    return {
                        ...attachment,
                        url: `data:${attachment.contentType};base64,${base64}`
                    };
                } catch (error) {
                    console.error(`Error processing local file ${attachment.url}:`, error);
                    return attachment; // 保留原始附件作为后备
                }
            })
        );

        return {
            ...message,
            experimental_attachments: updatedAttachments
        };
    } catch (error) {
        console.error('Error processing message:', error);
        return message; // 出错时返回原消息
    }
}
