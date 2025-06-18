import useSWR from 'swr';
import { useMemo } from 'react';
import { buildURL, fetcher } from '@/lib/utils';
import { type DatasetSamples } from '@prisma/client';
import type { QuestionsDTO } from '@/schema/questions';

type UseDatasetsParams = {
    projectId: string;
    pageIndex: number;
    pageSize: number;
    status: string;
    input: string;
    type: string;
    confirmed: string;
};

interface DatasetListResponse {
    data: DatasetSamples[];
    total: number;
    confirmedCount: number;
}

interface DatasetInfoResponse {
    data: QuestionsDTO[];
    total: number;
    confirmedCount: number;
}

export function useDatasets(params: UseDatasetsParams) {
    const url = useMemo(() => {
        if (!params.projectId) return null;

        const paramsObj = {
            page: params.pageIndex + 1,
            size: params.pageSize,
            ...(params.input && { input: params.input }),
            type: params.type,
            confirmed: params.confirmed
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

export function useDatasetsInfo({ projectId, questionId }: { projectId: string; questionId: string }) {
    const { data, error, isLoading, mutate } = useSWR(`/api/project/${projectId}/questions/${questionId}`, fetcher);

    return {
        datasets: data?.data || {},
        total: data?.total || 0,
        confirmedCount: data?.confirmedCount || 0,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
