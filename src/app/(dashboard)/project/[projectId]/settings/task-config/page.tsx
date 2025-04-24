'use client';
import { useParams } from 'next/navigation';

export default function Page() {
    let { projectId } = useParams();
    return <div className="@container/main flex flex-1 flex-col gap-2">{projectId} Task Config</div>;
}
