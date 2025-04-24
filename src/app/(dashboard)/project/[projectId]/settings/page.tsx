'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useModelConfig } from '@/hooks/use-model-config';

export default function Page() {
    const { projectId } = useParams();
    const router = useRouter();
    useModelConfig(projectId as string);

    // 使用 useEffect 处理路由跳转
    useEffect(() => {
        if (projectId) {
            router.push(`/project/${projectId}/settings/project-info`);
        }
    }, [projectId, router]);

    return null;
}
