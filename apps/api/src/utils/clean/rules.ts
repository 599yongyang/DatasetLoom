import { CleaningChange, CleaningResult } from '@/utils/clean/types';

export class CleaningRuleEngine {
    private rules: Map<string, CleaningRuleHandler> = new Map();

    constructor() {
        this.registerDefaultRules();
    }

    registerRule(ruleId: string, handler: CleaningRuleHandler) {
        this.rules.set(ruleId, handler);
    }

    async processText(text: string, rules: string[]): Promise<CleaningResult> {
        const startTime = Date.now();
        let cleanedText = text;
        const changes: CleaningChange[] = [];
        let changeCount = 0;

        for (const rule of rules) {
            const handler = this.rules.get(rule);
            if (handler) {
                const result = await handler(cleanedText);
                if (result.changed) {
                    cleanedText = result.text;
                    changes.push({
                        rule: rule,
                        before: result.original || cleanedText,
                        after: result.text
                    });
                    changeCount++;
                }
            }
        }

        return {
            original: text,
            cleaned: cleanedText,
            changes,
            stats: {
                originalLength: text.length,
                cleanedLength: cleanedText.length,
                changeCount,
                processingTime: Date.now() - startTime
            }
        };
    }

    private registerDefaultRules() {
        this.registerRule('remove-extra-whitespace', removeExtraWhitespace);
        this.registerRule('remove-html-tags', removeHtmlTags);
        this.registerRule('remove-invisible-chars', removeInvisibleChars);
        this.registerRule('normalize-unicode', normalizeUnicode);
        this.registerRule('remove-redundant-newlines', removeRedundantNewlines);
        this.registerRule('remove-urls', removeUrls);
        this.registerRule('remove-emails', removeEmails);
        this.registerRule('full-width-to-half-width', fullWidthToHalfWidth);

    }
}

// 具体的清洗规则处理器
type CleaningRuleHandler = (text: string) => Promise<CleaningRuleResult>;

interface CleaningRuleResult {
    text: string;
    changed: boolean;
    original?: string;
}

// 1. 去除多余空白
export const removeExtraWhitespace: CleaningRuleHandler = async (text) => {
    const original = text;
    const cleaned = text
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/g, '');

    return {
        text: cleaned,
        changed: cleaned !== original,
        original
    };
};

// 2. 去除HTML标签
export const removeHtmlTags: CleaningRuleHandler = async (text) => {
    const original = text;
    const cleaned = text.replace(/<[^>]*>/g, '');
    return {
        text: cleaned,
        changed: cleaned !== original,
        original
    };
};

// 3. 去除不可见字符
export const removeInvisibleChars: CleaningRuleHandler = async (text) => {
    // 去除控制字符（除了换行和制表符）
    const cleaned = text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');
    return { text: cleaned, changed: cleaned !== text };
};

// 4. Unicode标准化
export const normalizeUnicode: CleaningRuleHandler = async (text) => {
    const original = text;
    const cleaned = text.normalize('NFC');
    return {
        text: cleaned,
        changed: cleaned !== original,
        original
    };
};

// 5. 去除多余换行
export const removeRedundantNewlines: CleaningRuleHandler = async (text, params = { maxConsecutive: 2 }) => {
    const { maxConsecutive = 2 } = params;
    const original = text;
    const pattern = new RegExp(`\\n{${maxConsecutive + 1},}`, 'g');
    const cleaned = text.replace(pattern, '\n'.repeat(maxConsecutive));
    return {
        text: cleaned,
        changed: cleaned !== original,
        original
    };
};


// 6. 去除URL链接
export const removeUrls: CleaningRuleHandler = async (text) => {
    const cleaned = text.replace(/https?:\/\/[^\s]+/g, '');
    return { text: cleaned, changed: cleaned !== text };
};

// 7. 去除Email地址
export const removeEmails: CleaningRuleHandler = async (text) => {
    const cleaned = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
    return { text: cleaned, changed: cleaned !== text };
};

// 8. 转换全角字符到半角
export const fullWidthToHalfWidth: CleaningRuleHandler = async (text) => {
    let cleaned = text;
    // 全角字母数字转半角
    cleaned = cleaned.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s =>
        String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
    );
    // 全角空格转半角
    cleaned = cleaned.replace(/　/g, ' ');
    // 全角标点转半角
    cleaned = cleaned.replace(/[！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝～]/g, s =>
        String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
    );

    return { text: cleaned, changed: cleaned !== text };
};

