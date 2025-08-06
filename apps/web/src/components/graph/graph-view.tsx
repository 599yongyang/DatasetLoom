'use client';
import React, { useEffect, useRef, useState } from 'react';
import { CommonEvent, type GraphData, Graph, type EdgeData } from '@antv/g6';
import GraphSheet from '@/components/graph/graph-sheet';
import { stringToColor } from '@/lib/utils';

interface CustomNodeData {
    id: string;
    name: string;
    metadata: {
        domain: string;
        chunkId: string;
    };
}

export function GraphView({ nodes, edges }: { nodes?: CustomNodeData[]; edges?: EdgeData[] }) {
    const containerRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = React.useState(false);
    const [nodeId, setNodeId] = useState('');
    useEffect(() => {
        if (!containerRef.current) return;

        const graph = new Graph({
            container: containerRef.current,
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,

            // 节点样式
            node: {
                style: {
                    labelText: (d: any) => d.label
                },
                state: {
                    highlight: { fill: '#D580FF', halo: true },
                    dim: { fill: '#99ADD1' }
                }
            },

            // 边样式
            edge: {
                type: 'line',
                style: {
                    labelText: d => d.label as string,
                    labelBackground: true,
                    endArrow: true,
                    badgeBackgroundWidth: 12,
                    badgeBackgroundHeight: 12
                },
                state: {
                    highlight: { stroke: '#D580FF' }
                }
            },

            // 布局配置
            layout: {
                type: 'force',
                linkDistance: 50,
                clustering: true,
                nodeClusterBy: 'cluster',
                clusterNodeStrength: 70
            },
            animation: false,
            // 交互行为
            behaviors: [
                'zoom-canvas',
                'drag-canvas',
                'drag-element',
                {
                    type: 'hover-activate',
                    degree: 1,
                    state: 'highlight',
                    inactiveState: 'dim'
                }
            ]
        });

        // 处理数据
        const graphData = {
            nodes: nodes?.map(node => ({
                id: node.id,
                label: node.name,
                metadata: node.metadata,
                style: {
                    fill: stringToColor(node.metadata.domain)
                }
            })),
            edges: edges?.map(edge => ({
                source: edge.source,
                target: edge.target,
                label: edge.label
            }))
        };

        graph.setData(graphData);
        graph.render();

        // // 点击事件
        // graph.on(CommonEvent.CLICK, (evt: any) => {
        //     if (evt.targetType === 'node') {
        //         const {target} = evt; // 获取被点击节点的 ID
        //         console.log(`节点 ${target.id} 被点击了`);
        //         // 获取节点数据
        //         const nodeData = graph.getNodeData(target.id);
        //         console.log('节点数据:', nodeData);
        //         setNodeId(nodeData.metadata.chunkId);
        //         setOpen(true);
        //     } else if (evt.targetType === 'edge') {
        //         console.log('点击边:', evt.target.id);
        //     }
        // });

        // 窗口大小变化时重绘
        const handleResize = () => {
            if (graph && !graph.destroyed) {
                graph.setSize(containerRef.current!.clientWidth, containerRef.current!.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (graph && !graph.destroyed) {
                graph.destroy();
            }
        };
    }, [nodes, edges]);

    return (
        <>
            <div ref={containerRef} className="w-full h-full"></div>
            <GraphSheet open={open} nodeId={nodeId} setOpen={setOpen} />
        </>
    );
}
