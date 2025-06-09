export type ParseInput = {
    url?: string;
    pdf?: string;
    filePath?: string;
    [key: string]: any; // 支持扩展字段
};

export interface Parser {
    parse(input: ParseInput): Promise<string>;
}
