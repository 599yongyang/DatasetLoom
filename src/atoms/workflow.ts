import { atom } from 'jotai';
import type { Documents } from '@prisma/client';
import { defaultQuestionsStrategyConfig, type QuestionStrategyParams } from '@/types/question';
import { type DatasetStrategyParams, defaultDatasetStrategyConfig } from '@/types/dataset';

type DocumentState = {
    data: Documents[] | null;
};
// 文档内容状态
export const documentWorkFlowAtom = atom<DocumentState>();

// 分块策略
interface ChunkStrategy {
    strategy: 'auto' | 'custom' | 'page';
    chunkSize: number;
    chunkOverlap: number;
    separators?: string;
}

export const defaultChunkConfig: ChunkStrategy = {
    strategy: 'auto',
    chunkSize: 3000,
    chunkOverlap: 125,
    separators: ''
};

export const chunkWorkFlowAtom = atom<ChunkStrategy>({} as ChunkStrategy);

// 生成问题配置
export const questionsWorkFlowAtom = atom<QuestionStrategyParams>(defaultQuestionsStrategyConfig);

// 生成数据集配置
export const datasetWorkFlowAtom = atom<DatasetStrategyParams>(defaultDatasetStrategyConfig);
