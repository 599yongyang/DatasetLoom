import { atomWithStorage } from 'jotai/utils';
import type { ModelConfig } from '@prisma/client';
import { atom } from 'jotai';
import { UserInfo } from '@/lib/session';

export const navOpenItemsAtom = atomWithStorage<Record<string, boolean>>('nav-open-items', {});

export const selectedProjectAtom = atomWithStorage<string>('selectedProject', '');

export const modelConfigListAtom = atomWithStorage<ModelConfig[]>('modelConfigList', []);

export const selectedModelInfoAtom = atomWithStorage<ModelConfig>('selectedModelInfo', {} as ModelConfig);

export const datasetViewModeAtom = atomWithStorage<string>('datasetViewMode', 'all');

export const chunkConfigHashAtom = atom<string>('');

export const userInfoAtom = atomWithStorage<UserInfo>('userInfo', {} as UserInfo);
