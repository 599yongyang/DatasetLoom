'use client';
import React, { useEffect, useRef, useState } from 'react';
import { CommonEvent, type GraphData, Graph } from '@antv/g6';
import GraphSheet from '@/components/graph/graph-sheet';

export function GraphView({ nodes, edges }: GraphData) {
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
                style: {
                    labelText: (d: any) => d.label,
                    stroke: '#aaa',
                    lineWidth: 1
                },
                state: {
                    highlight: { stroke: '#D580FF' }
                }
            },

            // 布局配置
            layout: {
                type: 'd3-force',
                linkDistance: 200, // 控制边长度
                nodeStrength: -30, // 节点排斥力（负值）
                edgeStrength: 0.2, // 边吸引力
                preventOverlap: true,
                alpha: 0.3,
                alphaDecay: 0.01
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
                label: node.label,
                style: {
                    fill: node.type === 'chunk' ? '#4096ff' : node.type === 'domain' ? '#faad14' : '#5D7092'
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

        // 点击事件
        graph.on(CommonEvent.CLICK, (evt: any) => {
            if (evt.targetType === 'node') {
                console.log('点击节点:', evt.target.id);
                setNodeId(evt.target.id);
                setOpen(true);
            } else if (evt.targetType === 'edge') {
                console.log('点击边:', evt.target.id);
            }
        });

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
