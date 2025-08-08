'use client';

import { GraphView } from '@/components/graph/graph-view';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/axios';

export default function Page() {
    const { projectId }: { projectId: string } = useParams();
    const searchParams = useSearchParams();
    const kid = searchParams.get('kid');
    const [data, setData] = useState({
        nodes: [],
        edges: []
    });
    const getGraphData = () => {
        const url = `/${projectId}/document/graph${kid ? `?id=${kid}` : ''}`;
        apiClient.get(url)
            .then(res => {
                setData(res.data.data);
            })
            .catch(err => {
                console.log(err);
            });
    };

    useEffect(() => {
        getGraphData();
    }, [kid]);

    return (
        <div className="@container/main h-[85vh]">
            <h1 style={{ textAlign: 'center' }}>知识图谱可视化</h1>
            {data.nodes.length > 0 && data.edges.length > 0 ? (
                <GraphView nodes={data.nodes} edges={data.edges} />
            ) : (
                <div className={'flex justify-center items-center h-full'}>
                    <div className={'text-center'}>
                        <p className={'text-gray-500'}>暂无数据</p>
                    </div>
                </div>
            )}

        </div>
    );
}
