import { fetcher } from '@/lib/utils';
import useSWR from 'swr';

export function useGetModelUsageList(projectId: string, modelConfigId: string, day: number) {
    const { data, error, mutate } = useSWR(
        `/api/project/${projectId}/dashboard?modelConfigId=${modelConfigId}&day=${day}`,
        fetcher
    );

    return {
        data: data,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}

export function useGetDatasetKanban(projectId: string) {
    const { data, error, mutate } = useSWR(`/api/project/${projectId}/dashboard/dataset`, fetcher);

    return {
        data: data,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}

export function useGetDomain(projectId: string, level: number) {
    const { data, error, mutate } = useSWR<
        {
            domain: string;
            count: number;
            value: number;
        }[]
    >(`/api/project/${projectId}/dashboard/domain?level=${level}`, fetcher);

    return {
        data: data,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}

export function useGetModelUseRank(projectId: string) {
    const { data, error, mutate } = useSWR(`/api/project/${projectId}/dashboard/model`, fetcher);

    return {
        data: data,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
