import useSWR from 'swr';
import { buildURL, fetcher } from '@/lib/utils';
import { useMemo } from 'react';
import { PretrainData } from '@/types/interfaces/pretrain';

interface Response {
    data: PretrainData[];
    total: number;
}

type Params = {
    projectId: string;
    pageIndex: number;
    pageSize: number;
    query?: string;
};

export function usePretrainList(params: Params) {
    const url = useMemo(() => {
        if (!params.projectId) return null;
        const paramsObj = {
            page: params.pageIndex + 1,
            size: params.pageSize,
            ...(params.query && { query: params.query })
        };
        return buildURL(`/${params.projectId}/pretrain`, paramsObj);
    }, [params]);


    const { data, error, mutate } = useSWR<Response>(url, fetcher, {
        keepPreviousData: true, // 切换分页时保持旧数据展示
        revalidateOnFocus: true
    });

    return {
        data: data?.data || [],
        total: data?.total || 0,
        isLoading: !error && !data,
        isError: !!error,
        refresh: () => mutate()
    };
}

