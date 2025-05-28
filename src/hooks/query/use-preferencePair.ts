import useSWR from 'swr';
import type { Datasets } from '@prisma/client';
import { fetcher } from '@/lib/utils';

export function useGetPreferencePair(projectId: string, questionId: string) {
    const { data, error, isLoading, mutate } = useSWR<Datasets[]>(
        `/api/project/${projectId}/preference-pair?questionId=${questionId}`,
        fetcher
    );

    return {
        data: data || [],
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
