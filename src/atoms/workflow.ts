import { atom } from 'jotai';
import { type Node, type Edge } from '@xyflow/react';
import type { Documents } from '@prisma/client';

// 基础节点和边
export const nodesAtom = atom<Node[]>([]);
export const edgesAtom = atom<Edge[]>([]);

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

interface QuestionsWorkFlow {
    type: 'default' | 'custom';
    modelName: string;
    modelConfigId: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    questionCountType: 'auto' | 'custom';
    questionCount: number;
}

export const defaultQuestionsConfig: QuestionsWorkFlow = {
    type: 'default',
    modelName: '',
    modelConfigId: '',
    temperature: 0.7,
    maxTokens: 8192,
    questionCountType: 'auto',
    questionCount: 5
};

// 生成问题配置
export const questionsWorkFlowAtom = atom<QuestionsWorkFlow>({} as QuestionsWorkFlow);

interface DatasetWorkFlow {
    type: 'default' | 'custom';
    modelName: string;
    modelConfigId?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
}

export const defaultDatasetConfig: DatasetWorkFlow = {
    type: 'default',
    modelName: 'gpt-3.5-turbo',
    modelConfigId: '',
    temperature: 0.7,
    maxTokens: 8192
};

// 生成数据集配置
export const datasetWorkFlowAtom = atom<DatasetWorkFlow>({
    type: 'default',
    modelName: 'gpt-3.5-turbo',
    modelConfigId: '',
    temperature: 0.7,
    maxTokens: 8192
});
