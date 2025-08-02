import useSWR from 'swr';
import { buildURL, fetcher } from '@/lib/utils';
import { useMemo } from 'react';
import type { ImageWithImageBlock } from '@/server/db/schema/image-block';

interface Response {
    data: ImageWithImageBlock[];
    total: number;
}

type ImagesParams = {
    projectId: string;
    pageIndex: number;
    pageSize: number;
    fileName: string;
    block?: string;
};

export function useImages(params: ImagesParams) {
    const url = useMemo(() => {
        if (!params.projectId) return null;
        const paramsObj = {
            page: params.pageIndex + 1,
            size: params.pageSize,
            ...(params.fileName && { fileName: params.fileName }),
            ...(params.block && { block: params.block })
        };
        return buildURL(`/api/project/${params.projectId}/images`, paramsObj);
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
