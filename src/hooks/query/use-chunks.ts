import useSWR from 'swr';
import { buildURL, fetcher, fetcherPost } from '@/lib/utils';
import type { ChunksVO } from '@/schema/chunks';
import { useMemo } from 'react';

interface Response {
    data: ChunksVO[];
    total: number;
}

type UseChunksParams = {
    projectId: string;
    pageIndex: number;
    pageSize: number;
    fileIds: string[];
    status: string;
};

export function useChunks(params: UseChunksParams) {
    const url = useMemo(() => {
        if (!params.projectId) return null;
        const paramsObj = {
            page: params.pageIndex + 1,
            size: params.pageSize
        };
        return buildURL(`/api/project/${params.projectId}/chunks`, paramsObj);
    }, [params]);

    const body = { array: params.fileIds, status: params.status };

    const { data, error, mutate } = useSWR<Response>([url, body], ([url, postBody]) => fetcherPost(url, postBody), {
        keepPreviousData: true, // 切换分页时保持旧数据展示
        revalidateOnFocus: true
    });

    return {
        chunks: data?.data || [],
        total: data?.total || 0,
        isLoading: !error && !data,
        isError: !!error,
        refresh: () => mutate()
    };
}

export function useGetChunkById({ projectId, chunkId }: { projectId: string; chunkId: string }) {
    if (!chunkId) {
        return { chunk: null };
    }
    const { data, error, isLoading, mutate } = useSWR(`/api/project/${projectId}/chunks/${chunkId}`, fetcher);
    return {
        chunk: data,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
