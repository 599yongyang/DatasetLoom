import useSWR from 'swr';
import { useMemo } from 'react';
import { buildURL, fetcher } from '@/lib/utils';
import type { QuestionsDTO } from '@/server/db/schema/questions';

type UseQuestionsParams = {
    projectId: string;
    pageIndex: number;
    pageSize: number;
    answerFilter: string;
    searchQuery: string;
    contextType: string;
};

interface Response {
    data: QuestionsDTO[];
    total: number;
}

export default function useQuestions(params: UseQuestionsParams) {
    const url = useMemo(() => {
        if (!params.projectId) return null;

        const paramsObj = {
            page: params.pageIndex + 1,
            size: params.pageSize,
            ...(params.answerFilter && { status: params.answerFilter }),
            ...(params.searchQuery && { input: params.searchQuery }),
            ...(params.contextType && { contextType: params.contextType })
        };

        return buildURL(`/api/project/${params.projectId}/questions`, paramsObj);
    }, [params]);

    const { data, error, mutate } = useSWR<Response>(url, fetcher, {
        keepPreviousData: true, // 切换分页时保持旧数据展示
        revalidateOnFocus: true
    });

    return {
        questions: data?.data || [],
        total: data?.total || 0,
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
