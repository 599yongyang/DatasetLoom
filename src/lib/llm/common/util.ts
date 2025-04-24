// 从 LLM 输出中提取 JSON
export function extractJsonFromLLMOutput(output: string) {
    // 先尝试直接 parse
    try {
        const json = JSON.parse(output);
        return json;
    } catch {}
    const jsonStart = output.indexOf('```json');
    const jsonEnd = output.lastIndexOf('```');
    if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = output.substring(jsonStart + 7, jsonEnd);
        try {
            const json = JSON.parse(jsonString);
            return json;
        } catch (error) {
            console.error('解析 JSON 时出错:', { error, llmResponse: output });
        }
    } else {
        console.error('模型未按标准格式输出:', output);
        return undefined;
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
