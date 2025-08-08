import useSWR from 'swr';
import {buildURL, fetcher} from '@/lib/utils';
import {useMemo} from 'react';
import {Chunks} from "@/types/interfaces";

interface Response {
    data: Chunks[];
    total: number;
}

type UseChunksParams = {
    projectId: string;
    pageIndex: number;
    pageSize: number;
    fileIds: string[];
    status: string;
    query: string
};

export function useChunks(params: UseChunksParams) {
    const url = useMemo(() => {
        if (!params.projectId) return null;
        const paramsObj = {
            page: params.pageIndex + 1,
            size: params.pageSize,
            ...(params.fileIds && {fileIds: params.fileIds.join(',')}),
            ...(params.status && {status: params.status}),
            ...(params.query && {query: params.query})
        };
        return buildURL(`/${params.projectId}/documentChunk`, paramsObj);
    }, [params]);


    const {data, error, mutate} = useSWR<Response>(url, fetcher, {
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

export function useGetChunkById({projectId, chunkId}: { projectId: string; chunkId: string }) {
    if (!chunkId) {
        return {chunk: null};
    }
    const {data, error, isLoading, mutate} = useSWR(
        chunkId && `/${projectId}/documentChunk/getInfo/${chunkId}`,
        fetcher
    );
    return {
        chunk: data,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
