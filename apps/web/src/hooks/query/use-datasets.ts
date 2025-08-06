import useSWR from 'swr';
import {useMemo} from 'react';
import {buildURL, fetcher} from '@/lib/utils';
import {type DatasetSamples} from '@prisma/client';

type UseDatasetsParams = {
    projectId: string;
    pageIndex: number;
    pageSize: number;
    status: string;
    query: string;
    showType: string;
    confirmed: string;
    contextType: string;
};

interface DatasetListResponse {
    data: DatasetSamples[];
    total: number;
    confirmedCount: number;
}

export function useDatasets(params: UseDatasetsParams) {
    const url = useMemo(() => {
        if (!params.projectId) return null;

        const paramsObj = {
            page: params.pageIndex + 1,
            size: params.pageSize,
            ...(params.query && {query: params.query}),
            showType: params.showType,
            ...(params.confirmed !== 'all' && {confirmed: params.confirmed}),
            ...(params.contextType !== 'all' && {contextType: params.contextType}),
        };

        return buildURL(`/${params.projectId}/qa-dataset`, paramsObj);
    }, [params]);

    const {data, error, mutate} = useSWR<DatasetListResponse>(url, fetcher, {
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

export function useDatasetsInfo({projectId, questionId}: { projectId: string; questionId: string }) {
    const {data, error, isLoading, mutate} = useSWR(`/${projectId}/qa-dataset/${questionId}`, fetcher);

    return {
        datasets: data?.data || {},
        total: data?.total || 0,
        confirmedCount: data?.confirmedCount || 0,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
