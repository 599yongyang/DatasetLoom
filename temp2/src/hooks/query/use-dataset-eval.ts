import { useMemo } from 'react';
import { buildURL, fetcher } from '@/lib/utils';
import useSWR from 'swr';

export function useDatasetEvalList({
    projectId,
    sampleId,
    sampleType
}: {
    sampleId: string;
    sampleType: string;
    projectId: string;
}) {
    const url = useMemo(() => {
        if (!projectId) return null;
        return buildURL(`/api/project/${projectId}/datasets/ai-score`, {
            sampleId,
            sampleType
        });
    }, [{ projectId, sampleId, sampleType }]);

    const { data, error, mutate } = useSWR(url, fetcher);

    return {
        data: data || [],
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
