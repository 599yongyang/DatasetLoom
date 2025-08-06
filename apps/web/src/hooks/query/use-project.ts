import useSWR from 'swr';
import {buildURL, fetcher} from '@/lib/utils';
import type {ProjectsWithCounts} from '@prisma-type';
import type {ProjectRole} from '@prisma-enum';
import React, {useEffect, useMemo, useRef} from 'react';

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

interface Response {
    data: ProjectMember[];
    total: number;
}

export function useGetProjects() {
    const {data, error, isLoading, mutate} = useSWR<ProjectsWithCounts[]>('/project', fetcher);
    // const { update } = useSession();

    const prevProjectIds = useRef<string[]>([]);

    useEffect(() => {
        if (!data) return;

        const currentProjectIds = data.map(p => p.id);
        const hasProjectChanged = !arraysEqual(prevProjectIds.current, currentProjectIds);

        if (hasProjectChanged) {
            // update({ refresh: true });
            // 更新缓存值
            prevProjectIds.current = currentProjectIds;
        }
    }, [data]);
    return {
        projects: data || [],
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}

type GetProjectMemberParams = {
    projectId: string;
    pageIndex: number;
    pageSize: number;
    query: string;
};

export function useGetProjectMember(params: GetProjectMemberParams) {

    const url = useMemo(() => {
        if (!params.projectId) return null;

        const paramsObj = {
            page: params.pageIndex + 1,
            size: params.pageSize,
            ...(params.query && {query: params.query}),
        };

        return buildURL(`/${params.projectId}/project-member`, paramsObj);
    }, [params]);

    const {data, error, mutate} = useSWR<Response>(url, fetcher, {
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

function arraysEqual(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => item === b[index]);
}
