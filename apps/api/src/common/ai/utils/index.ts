import { CoreAssistantMessage, CoreToolMessage, UIMessage } from 'ai';

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export class MessageUtil {
    static getTrailingMessageId({ messages }: { messages: Array<ResponseMessage> }): string | null {
        const trailingMessage = messages.at(-1);

        if (!trailingMessage) return null;

        return trailingMessage.id;
    }

    static getMostRecentUserMessage(messages: Array<UIMessage>) {
        const userMessages = messages.filter(message => message.role === 'user');
        return userMessages.at(-1);
    }
}


/**
 * 问题数量计算算法
 */
export function calculateOptimalQuestionCount(text: string): number {
    const textLength = text.length;

    // 基础问题数（基于文本长度）
    let baseCount = Math.floor(textLength / 400); // 调整基础比例

    // 概念密度分析（技术术语、专有名词）
    const technicalTerms = text.match(/[A-Z]{2,}|[A-Za-z]+[A-Z][a-z]+|\b[A-Z][a-z]*[A-Z][a-z]*\b/g) || [];
    const conceptBonus = Math.floor(technicalTerms.length / 8); // 降低权重

    // 结构化内容检测（列表、步骤等）
    const structurePatterns = text.match(/[1-9]\.|[•·▪▫◦‣⁃]\s|第[一二三四五六七八九十]\w/g) || [];
    const structureBonus = Math.floor(structurePatterns.length / 5);

    // 信息密度评估
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 10);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    const densityFactor = avgSentenceLength > 50 ? 1.2 : avgSentenceLength < 20 ? 0.8 : 1;

    const finalCount = Math.floor((baseCount + conceptBonus + structureBonus) * densityFactor);

    // 合理范围限制
    return Math.min(25, Math.max(2, finalCount));
}

