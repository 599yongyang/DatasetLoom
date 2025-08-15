import useSWR from 'swr';
import { buildURL, fetcher } from '@/lib/utils';
import { useMemo } from 'react';
import { PromptTemplate } from '@/types/interfaces/prompt';
import { PromptTemplateType } from '@repo/shared-types';

interface Response {
    data: PromptTemplate[];
    total: number;
}

type PromptTemplateParams = {
    projectId: string;
    pageIndex: number;
    pageSize: number;
    name: string;
};

export function usePromptTemplate(params: PromptTemplateParams) {
    const url = useMemo(() => {
        if (!params.projectId) return null;
        const paramsObj = {
            page: params.pageIndex + 1,
            size: params.pageSize,
            ...(params.name && { name: params.name })
        };
        return buildURL(`/${params.projectId}/prompt-template`, paramsObj);
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

export function useGetPromptTemplateById({ projectId, promptId }: { projectId: string; promptId: string }) {
    if (!promptId) {
        return { data: null };
    }
    const { data, error, isLoading, mutate } = useSWR<PromptTemplate>(
        promptId && `/${projectId}/prompt-template/getInfo/${promptId}`,
        fetcher
    );
    return {
        data: data,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}

export function useGetPromptTemplateSelect({ projectId, type }: { projectId: string; type: PromptTemplateType }) {
    const { data, error, isLoading, mutate } = useSWR<PromptTemplate[]>(
        type && `/${projectId}/prompt-template/select?type=${type}`,
        fetcher
    );
    return {
        data: data,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
