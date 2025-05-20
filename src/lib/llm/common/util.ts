import { z } from 'zod';

/**
 * 安全解析并验证大模型返回的 JSON 数据，支持自动适配对象/数组格式
 * @param jsonString 大模型返回的 JSON 字符串
 * @param schema 预期的 Zod Schema（可以是对象、数组等）
 * @returns 解析和验证后的数据（保持 schema 的结构）
 */
export async function doubleCheckModelOutput<T>(jsonString: string, schema: z.ZodSchema<T>): Promise<T> {
    let parsedData: unknown;

    try {
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

export function extractThinkChain(text: string): string {
    const markers = [
        { start: '</think>', end: '' },
        { start: '<thinking>', end: '</thinking>' }
    ];

    for (const { start, end } of markers) {
        const startIndex = text.indexOf(start);
        if (startIndex === -1) continue;

        const contentStart = startIndex + start.length;
        const endIndex = end ? text.indexOf(end, contentStart) : -1;

        if (end && endIndex === -1) continue;

        return text.slice(contentStart, endIndex === -1 ? undefined : endIndex).trim();
    }

    return '';
}

export function extractAnswer(text: string): string {
    const patterns = [
        { start: '</think>', end: '' },
        { start: '<thinking>', end: '</thinking>' }
    ];

    for (const { start, end } of patterns) {
        const startIndex = text.indexOf(start);
        if (startIndex === -1) continue;

        const contentStartIndex = startIndex + start.length;
        const endIndex = end ? text.indexOf(end, contentStartIndex) : -1;

        if (end && endIndex === -1) continue; // 如果有结束标签但没找到，跳过

        const before = text.slice(0, startIndex).trim();
        const after = end ? text.slice(endIndex + end.length).trim() : text.slice(contentStartIndex).trim();

        return [before, after].filter(Boolean).join(' ').trim();
    }

    return text.trim();
}
