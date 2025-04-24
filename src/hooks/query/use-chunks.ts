import useSWR from 'swr';
import { fetcherPost } from '@/lib/utils';
import type { ChunksVO } from '@/schema/chunks';

interface Response {
    data: ChunksVO[];
}

export function useChunks(projectId: string, selectedFiles: string[], status: string) {
    const key = `/api/project/${projectId}/chunks`;
    const body = { array: selectedFiles, filter: status };

    const { data, error, mutate } = useSWR<Response>([key, body], ([url, postBody]) => fetcherPost(url, postBody));

    return {
        chunks: data?.data || ([] as ChunksVO[]),
        isLoading: !error && !data,
        isError: !!error,
        refresh: () => mutate()
    };
}
