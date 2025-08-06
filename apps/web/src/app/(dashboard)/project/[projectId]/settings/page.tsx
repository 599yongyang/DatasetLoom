'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
    const { projectId } = useParams();
    const router = useRouter();

    // 使用 useEffect 处理路由跳转
    useEffect(() => {
        if (projectId) {
            router.push(`/project/${projectId}/settings/project-info`);
        }
    }, [projectId, router]);

    return null;
}
