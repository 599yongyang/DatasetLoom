import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';
import type { CoreAssistantMessage, CoreToolMessage, UIMessage } from 'ai';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
    info: string;
    status: number;
}

export const fetcher = async (url: string) => {
    const res = await fetch(url);

    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.') as ApplicationError;

        error.info = await res.json();
        error.status = res.status;

        throw error;
    }

    return res.json();
};

export const fetcherPost = async (url: string, body: any) => {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error('请求失败');

    return res.json();
};

export function isEmptyObject(obj: any): boolean {
    return obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0;
}

export function buildURL(base: string, params: Record<string, string | number | boolean>) {
    const search = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    return search ? `${base}?${search}` : base;
}

export function getMostRecentUserMessage(messages: Array<UIMessage>) {
    const userMessages = messages.filter(message => message.role === 'user');
    return userMessages.at(-1);
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function getTrailingMessageId({ messages }: { messages: Array<ResponseMessage> }): string | null {
    const trailingMessage = messages.at(-1);

    if (!trailingMessage) return null;

    return trailingMessage.id;
}

/**
 * 安全解析并验证大模型返回的 JSON 数据，支持自动适配对象/数组格式
 * @param jsonString 大模型返回的 JSON 字符串
 * @param schema 预期的 Zod Schema（可以是对象、数组等）
 * @returns 解析和验证后的数据（保持 schema 的结构）
 */
export async function doubleCheckModelOutput<T>(jsonString: string, schema: z.ZodSchema<T>): Promise<T> {
    let parsedData: unknown;

    try {
        // Step 1: 尝试解析 JSON 代码块
        const jsonCodeBlockMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/i);
        if (jsonCodeBlockMatch && jsonCodeBlockMatch[1]) {
            jsonString = jsonCodeBlockMatch[1].trim();
        }
        jsonString = jsonString.trim();
        try {
            parsedData = JSON.parse(jsonString);
        } catch (parseError) {
            throw new Error(`JSON 解析失败: ${(parseError as Error).message}`);
        }

        // Step 2: 推断 schema 的类型（array / object / 其他）
        const isSchemaArray = schema instanceof z.ZodArray;
        const isSchemaObject = schema instanceof z.ZodObject;

        const isArrayInput = Array.isArray(parsedData);
        const isObjectInput = typeof parsedData === 'object' && parsedData !== null && !isArrayInput;

        // Step 3: 如果 schema 是 array，但输入是 object，自动包装成数组
        if (isSchemaArray && isObjectInput) {
            parsedData = [parsedData];
        }

        // Step 4: 如果 schema 是 object，但输入是 array，取第一个元素（如果存在）
        if (isSchemaObject && isArrayInput && (parsedData as any[]).length > 0) {
            parsedData = (parsedData as any[])[0];
        }

        // Step 5: 使用 Zod 异步安全校验
        const result = await schema.safeParseAsync(parsedData);

        if (!result.success) {
            const errorDetails = result.error.issues.map(issue => ({
                path: issue.path.join('.'),
                message: issue.message,
                expected: issue.code === 'invalid_type' ? issue.expected : undefined,
                received: issue.code === 'invalid_type' ? issue.received : undefined
            }));

            throw new Error(`数据验证失败:\n${errorDetails.map(e => `- ${e.path}: ${e.message}`).join('\n')}`);
        }

        return result.data;
    } catch (error) {
        console.error('格式化大模型输出时出错:', error);
        throw error;
    }
}

// 生成文件内容
export const generateFileContent = (data: any[], format: string) => {
    if (format === 'jsonl') {
        return {
            content: data.map(item => JSON.stringify(item)).join('\n'),
            extension: 'jsonl',
            mimeType: 'application/jsonl'
        };
    }
    return {
        content: JSON.stringify(data, null, 2),
        extension: 'json',
        mimeType: 'application/json'
    };
};

//  下载文件
export const downloadFile = (content: string, fileName: string, extension: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
}
