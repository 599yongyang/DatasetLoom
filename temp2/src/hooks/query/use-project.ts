import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import type { ProjectsWithCounts } from '@/server/db/schema/project';
import type { ProjectRole } from 'src/server/db/types';
import { useSession } from 'next-auth/react';
import React from 'react';

export interface ProjectMember {
    id: string;
    role: ProjectRole;
    joinedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
}

export function useGetProjects() {
    const { data, error, isLoading, mutate } = useSWR<ProjectsWithCounts[]>('/api/project', fetcher);
    const { update } = useSession();

    const prevProjectIds = React.useRef<string[]>([]);

    React.useEffect(() => {
        if (!data) return;

        const currentProjectIds = data.map(p => p.id);
        const hasProjectChanged = !arraysEqual(prevProjectIds.current, currentProjectIds);

        if (hasProjectChanged) {
            update({ refresh: true });
            // 更新缓存值
            prevProjectIds.current = currentProjectIds;
        }
    }, [data, update]);
    return {
        projects: data || [],
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}

export function useGetProjectMember(projectId: string, input: string) {
    const { data, error, isLoading, mutate } = useSWR<ProjectMember[]>(
        `/api/project/${projectId}/project-member?input=${input}`,
        fetcher
    );
    return {
        data: data || [],
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}
function arraysEqual(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => item === b[index]);
}
