import useSWR from 'swr';
import { buildURL, fetcher } from '@/lib/utils';
import { useMemo } from 'react';
import type { DocumentsWithCount } from '@/server/db/schema/documents';

interface Response {
    data: DocumentsWithCount[];
    total: number;
}

type UseDocumentsParams = {
    projectId: string;
    pageIndex: number;
    pageSize: number;
    fileName: string;
    fileExt: string;
};

export function useDocuments(params: UseDocumentsParams) {
    const url = useMemo(() => {
        if (!params.projectId) return null;
        const paramsObj = {
            page: params.pageIndex + 1,
            size: params.pageSize,
            ...(params.fileName && { fileName: params.fileName }),
            ...(params.fileExt && { fileExt: params.fileExt })
        };
        return buildURL(`/api/project/${params.projectId}/documents`, paramsObj);
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
