import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import { type ModelConfig } from '@prisma/client';
import { useSetAtom } from 'jotai/index';
import { modelConfigListAtom, selectedModelInfoAtom } from '@/atoms';

export function useGetModelConfig(projectId: string, providerName: string) {
    const shouldFetch = projectId && providerName;

    const { data, error, isLoading, mutate } = useSWR<ModelConfig[]>(
        shouldFetch ? `/api/project/${projectId}/model-config?providerId=${providerName}` : null,
        fetcher
    );

    return {
        data: data || [],
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}

export function useModelConfigSelect(projectId: string) {
    const setModelConfigList = useSetAtom(modelConfigListAtom);
    const setSelectedModelInfo = useSetAtom(selectedModelInfoAtom);
    const { data, error, isLoading, mutate } = useSWR<ModelConfig[]>(
        projectId ? `/api/project/${projectId}/model-config?status=1` : null,
        fetcher
    );
    if (data) {
        setTimeout(() => {
            setModelConfigList(data);
            const selectedModelInfo = data.length > 0 ? data[0] : {};
            setSelectedModelInfo(selectedModelInfo as ModelConfig);
        }, 0);
    }
    return {
        data: data || [],
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
