import useSWR from 'swr';
import {useMemo} from 'react';
import {buildURL, fetcher} from '@/lib/utils';
import {QuestionsWithDatasetSample} from "@prisma-type";

type UseQuestionsParams = {
    projectId: string;
    pageIndex: number;
    pageSize: number;
    answerFilter: string;
    searchQuery: string;
    contextType: string;
};

interface Response {
    data: QuestionsWithDatasetSample[];
    total: number;
}

export default function useQuestions(params: UseQuestionsParams) {
    const url = useMemo(() => {
        if (!params.projectId) return null;

        const paramsObj = {
            page: params.pageIndex + 1,
            size: params.pageSize,
            ...(params.answerFilter && {status: params.answerFilter}),
            ...(params.searchQuery && {input: params.searchQuery}),
            ...(params.contextType !== 'all' && {contextType: params.contextType})
        };

        return buildURL(`/${params.projectId}/question`, paramsObj);
    }, [params]);

    const {data, error, mutate} = useSWR<Response>(url, fetcher, {
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
