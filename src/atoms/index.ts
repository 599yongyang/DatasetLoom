import { atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai';
import type { ProjectsWithCounts } from '@/schema/project';
import type { ModelConfig } from '@prisma/client';

export const navOpenItemsAtom = atomWithStorage<Record<string, boolean>>('nav-open-items', {});

export const projectListAtom = atom<ProjectsWithCounts[]>([]);

export const selectedProjectAtom = atomWithStorage<string>('selectedProject', '');

export const modelConfigListAtom = atomWithStorage<ModelConfig[]>('modelConfigList', []);

export const selectedModelInfoAtom = atomWithStorage<ModelConfig>('selectedModelInfo', {} as ModelConfig);
