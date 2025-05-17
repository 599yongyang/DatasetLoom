import useSWR from 'swr';
import { useMemo } from 'react';
import { buildURL, fetcher } from '@/lib/utils';
import { type WorkFlow } from '@prisma/client';

type UseWorkflowsParams = {
    projectId: string;
    pageIndex: number;
    pageSize: number;
};

interface DatasetListResponse {
    data: WorkFlow[];
    total: number;
}

export function useWorkflows(params: UseWorkflowsParams) {
    const url = useMemo(() => {
        if (!params.projectId) return null;

        const paramsObj = {
            page: params.pageIndex + 1,
            size: params.pageSize
        };

        return buildURL(`/api/project/${params.projectId}/workflow`, paramsObj);
    }, [params]);

    const { data, error, mutate } = useSWR<DatasetListResponse>(url, fetcher, {
        keepPreviousData: true, // 切换分页时保持旧数据展示
        revalidateOnFocus: true
    });

    return {
        workflows: data?.data || [],
        total: data?.total || 0,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}

export function useWorkflowById({ projectId, workflowId }: { projectId: string; workflowId: string }) {
    const { data, error, isLoading, mutate } = useSWR<WorkFlow>(
        `/api/project/${projectId}/workflow/${workflowId}`,
        fetcher
    );

    return {
        workflow: data,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
