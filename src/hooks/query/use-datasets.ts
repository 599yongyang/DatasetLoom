import useSWR from 'swr';
import { useMemo } from 'react';
import { buildURL, fetcher } from '@/lib/utils';
import type { Datasets } from '@prisma/client';

type UseDatasetsParams = {
    projectId: string;
    pageIndex: number;
    pageSize: number;
    status: string;
    input: string;
};

interface DatasetListResponse {
    data: Datasets[];
    total: number;
    confirmedCount: number;
}

interface DatasetInfoResponse {
    datasets: Datasets;
    total: number;
    confirmedCount: number;
}

export function useDatasets(params: UseDatasetsParams) {
    const url = useMemo(() => {
        if (!params.projectId) return null;

        const paramsObj = {
            page: params.pageIndex + 1,
            size: params.pageSize,
            ...(params.status && { status: params.status }),
            ...(params.input && { input: params.input })
        };

        return buildURL(`/api/project/${params.projectId}/datasets`, paramsObj);
    }, [params]);

    const { data, error, mutate } = useSWR<DatasetListResponse>(url, fetcher, {
        keepPreviousData: true, // 切换分页时保持旧数据展示
        revalidateOnFocus: true
    });

    return {
        datasets: data?.data || [],
        total: data?.total || 0,
        confirmedCount: data?.confirmedCount || 0,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}

export function useDatasetsId({ projectId, datasetId }: { projectId: string; datasetId: string }) {
    const { data, error, isLoading, mutate } = useSWR<DatasetInfoResponse>(
        `/api/project/${projectId}/datasets/${datasetId}`,
        fetcher
    );

    return {
        datasets: data?.datasets || ({} as Datasets),
        total: data?.total || 0,
        confirmedCount: data?.confirmedCount || 0,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
