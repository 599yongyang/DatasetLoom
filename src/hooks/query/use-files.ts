import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import { type UploadFiles } from '@prisma/client';

interface Response {
    data: UploadFiles[];
    total: number;
}

export function useFiles(projectId: string) {
    const { data, error, mutate } = useSWR<Response>(`/api/project/${projectId}/files`, fetcher);

    return {
        uploadedFiles: data?.data || [],
        total: data?.total || 0,
        isLoading: !error && !data,
        isError: !!error,
        refresh: () => mutate()
    };
}
