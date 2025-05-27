import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import type { ProjectsWithCounts } from '@/schema/project';

export function useGetProjects() {
    const { data, error, isLoading, mutate } = useSWR<ProjectsWithCounts[]>('/api/project', fetcher);
    return {
        projects: data || [],
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}

export function useGetProjectById(projectId: string) {
    const { data, error, isLoading, mutate } = useSWR(`/api/project/${projectId}`, fetcher);
    return {
        project: data || [],
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
