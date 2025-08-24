import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import { type ModelConfig } from '@/types/interfaces';
import { useSetAtom } from 'jotai/index';
import { modelConfigListAtom, selectedModelInfoAtom } from '@/atoms';
import { useEffect } from 'react';

export function useModelConfigList(projectId: string, providerName: string) {
    const shouldFetch = projectId && providerName;

    const { data, error, isLoading, mutate } = useSWR<ModelConfig[]>(
        shouldFetch ? `/${projectId}/model-config/getListByProviderId?providerId=${providerName}` : null,
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
        projectId ? `/${projectId}/model-config/getAvailableList` : null,
        fetcher
    );
    useEffect(() => {
        setModelConfigList(data || []);
        const defaultModel = data?.find(item => item.isDefault);
        setSelectedModelInfo(defaultModel || ({} as ModelConfig));
    }, [data, setModelConfigList, setSelectedModelInfo]);

    return {
        data: data || [],
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
