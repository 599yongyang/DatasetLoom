import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import { type ParserConfig } from '@prisma/client';

export function useGetParserConfig(projectId: string) {
    const { data, error, isLoading, mutate } = useSWR<ParserConfig[]>(
        `/${projectId}/parser-config`,
        fetcher
    );
    return {
        data: data || [],
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
