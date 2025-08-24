import useSWR from 'swr';
import type { DatasetSamples } from '@/types/interfaces';
import { fetcher } from '@/lib/utils';

export function usePreferencePairList(projectId: string, questionId: string) {
    const { data, error, isLoading, mutate } = useSWR<DatasetSamples[]>(
        `/${projectId}/qa-dataset/preference-pair?questionId=${questionId}`,
        fetcher
    );

    return {
        data: data || [],
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
