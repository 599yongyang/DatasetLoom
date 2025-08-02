import { getBlockCoordinates } from '@/server/db/image-block';

interface ProcessedQuestion {
    realQuestion: string;
    regions: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        label: string;
        id: string;
    }>;
}

/**
 * 替换文本中的标注引用为坐标，并提取区域信息
 * @param text 包含标注的原始文本，如"这个区域@[标注A](123)和@[标注B](456)的关系是什么？"
 * @returns 包含处理后的问题和区域信息的对象
 */
export async function replaceMentionsWithCoordinates(text: string): Promise<ProcessedQuestion> {
    const regex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const matches = [...text.matchAll(regex)];

    const regions = [];
    let replacedText = text;

    for (const match of matches) {
        const [fullMatch, label, blockId] = match;

        if (!blockId) continue;
        // 获取坐标信息
        const coord = await getBlockCoordinates(blockId);
        if (!coord) continue;
        // 替换文本中的标注
        replacedText = replacedText.replace(
            fullMatch,
            `[x:${coord.x} y:${coord.y} w:${coord.width} h:${coord.height}]`
        );

        // 收集区域信息
        regions.push({
            ...coord,
            id: blockId
        });
    }

    return {
        realQuestion: replacedText,
        regions
    };
}
