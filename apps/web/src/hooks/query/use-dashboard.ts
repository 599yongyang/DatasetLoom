import {fetcher} from '@/lib/utils';
import useSWR from 'swr';

export function useGetModelUsageList(projectId: string, modelConfigId: string, day: number) {
    const {
        data,
        error,
        mutate
    } = useSWR(`/${projectId}/dashboard/model-usage?modelConfigId=${modelConfigId}&day=${day}`, fetcher);
    return {
        data: data,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}

export function useGetDatasetKanban(projectId: string) {
    const {data, error, mutate} = useSWR(`/${projectId}/dashboard/dataset`, fetcher);

    return {
        data: data,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}

export function useGetDomain(projectId: string, level: number) {
    const {data, error, mutate} = useSWR<
        {
            domain: string;
            count: number;
            value: number;
        }[]
    >(`/${projectId}/dashboard/domain?level=${level}`, fetcher);

    return {
        data: data,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}

export function useGetModelUseRank(projectId: string) {
    const {data, error, mutate} = useSWR(`/${projectId}/dashboard/model-use-rank`, fetcher);

    return {
        data: data,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
