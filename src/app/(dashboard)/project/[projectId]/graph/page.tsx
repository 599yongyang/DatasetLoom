'use client';

import { GraphView } from '@/components/graph/graph-view';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useSearchParams } from 'next/navigation';

export default function Page() {
    const { projectId }: { projectId: string } = useParams();
    const searchParams = useSearchParams();
    const kid = searchParams.get('kid');
    const [data, setData] = useState({
        nodes: [],
        edges: []
    });
    console.log(kid, 'kid');
    const getGraphData = () => {
        const url = `/api/project/${projectId}/graph${kid ? `?kid=${kid}` : ''}`;
        axios
            .get(url)
            .then(res => {
                setData(res.data);
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
            <GraphView nodes={data.nodes} edges={data.edges} />
        </div>
    );
}
