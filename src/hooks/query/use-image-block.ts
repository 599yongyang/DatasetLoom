import useSWR from 'swr';
import { buildURL, fetcher } from '@/lib/utils';
import { useMemo } from 'react';
import type { ImageBlockWithImage } from '@/server/db/schema/image-block';

interface Response {
    data: ImageBlockWithImage[];
    total: number;
}

type ImagesParams = {
    projectId: string;
    pageIndex: number;
    pageSize: number;
    label: string;
};

export function useImageBlocks(params: ImagesParams) {
    const url = useMemo(() => {
        if (!params.projectId) return null;
        const paramsObj = {
            page: params.pageIndex + 1,
            size: params.pageSize,
            ...(params.label && { fileName: params.label })
        };
        return buildURL(`/api/project/${params.projectId}/images/block`, paramsObj);
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
        refresh: mutate
    };
}
