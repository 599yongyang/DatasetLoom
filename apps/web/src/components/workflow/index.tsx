import { useCallback, useEffect, useState } from 'react';
import {
    addEdge,
    Background,
    Controls,
    MiniMap,
    type Node,
    type NodeTypes,
    Panel,
    Position,
    ReactFlow,
    useEdgesState,
    useNodesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { ChunkerNode, DatasetNode, DocumentNode, EndNode, QuestionNode, StartNode } from '@/components/workflow/nodes';
import { toast } from 'sonner';
import { useAtom } from 'jotai';
import {
    chunkWorkFlowAtom,
    datasetWorkFlowAtom,
    defaultChunkConfig,
    documentWorkFlowAtom,
    questionsWorkFlowAtom
} from '@/atoms/workflow';
import { useParams } from 'next/navigation';
import { initialEdges, initialNodes } from '@/constants/workflow';
import { useWorkflowById } from '@/hooks/query/use-workflow';
import { type WorkFlow } from '@prisma/client';
import SaveDialog from '@/components/workflow/save-dialog';
import { selectedModelInfoAtom } from '@/atoms';
import { defaultQuestionsStrategyConfig } from '@/types/question';
import { defaultDatasetStrategyConfig } from '@/types/dataset';

// 节点类型注册
const nodeTypes: NodeTypes = {
    start: StartNode,
    document: DocumentNode,
    chunker: ChunkerNode,
    question: QuestionNode,
    dataset: DatasetNode,
    end: EndNode
};

interface NodeTypeHandler {
    type: string;
    setter: (data: any) => void;
}

export default function Workflow() {
    const { projectId, workflowId } = useParams<{ projectId: string; workflowId: string }>();
    const { workflow, refresh } = useWorkflowById({ projectId, workflowId });

    const [nodes, setNodes, onNodesChange] = useNodesState(workflow ? JSON.parse(workflow.nodes) : initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(workflow ? JSON.parse(workflow.edges) : initialEdges);
    const [isRunning, setIsRunning] = useState(false);
    const onConnect = useCallback((params: any) => setEdges(eds => addEdge(params, eds)), [setEdges]);

    const [selectedModelInfo, setSelectedModelInfo] = useAtom(selectedModelInfoAtom);

    const [document, setDocument] = useAtom(documentWorkFlowAtom);
    const [chunkConfig, setChunkConfig] = useAtom(chunkWorkFlowAtom);
    const [questionConfig, setQuestionConfig] = useAtom(questionsWorkFlowAtom);
    const [datasetConfig, setDatasetConfig] = useAtom(datasetWorkFlowAtom);

    const [fromData, setFromData] = useState(workflow ?? ({} as WorkFlow));
    const [open, setOpen] = useState(false);

    const nodeTypeHandlers: NodeTypeHandler[] = [
        { type: 'document', setter: setDocument },
        { type: 'chunker', setter: setChunkConfig },
        { type: 'question', setter: setQuestionConfig },
        { type: 'dataset', setter: setDatasetConfig }
    ];

    useEffect(() => {
        if (!workflow) {
            handleReset();
            return;
        }

        try {
            setFromData(workflow);
            const parsedNodes: Node[] = JSON.parse(workflow.nodes);
            nodeTypeHandlers.forEach(({ type, setter }) => {
                const node = parsedNodes.find((n: Node) => n.type === type);
                if (node?.data) {
                    setter(node.data);
                }
            });
        } catch (error) {
            console.error('Failed to parse workflow nodes:', error);
        }
    }, [workflow]);
    const runWorkflow = () => {
        setIsRunning(true);
        setTimeout(() => {
            setIsRunning(false);
            toast.success('工作流执行完成！');
        }, 3000);
    };
    const handleSave = () => {
        const nodeData = nodes.map(node => {
            switch (node.type) {
                case 'document':
                    return { ...node, data: document };
                case 'chunker':
                    return { ...node, data: chunkConfig };
                case 'question':
                    return { ...node, data: questionConfig };
                case 'dataset':
                    return { ...node, data: datasetConfig };
                default:
                    return node;
            }
        });
        setFromData(
            workflow ??
                ({
                    name: '',
                    id: workflowId,
                    projectId,
                    nodes: JSON.stringify(nodeData),
                    edges: JSON.stringify(edges)
                } as WorkFlow)
        );
        setOpen(true);
    };

    const handleReset = () => {
        setNodes(initialNodes);
        setEdges(initialEdges);
        setDocument({ data: [] });
        setChunkConfig(defaultChunkConfig);
        if (selectedModelInfo) {
            defaultQuestionsStrategyConfig.modelConfigId = selectedModelInfo.id;
            defaultQuestionsStrategyConfig.modelName = selectedModelInfo.modelName;
            defaultDatasetStrategyConfig.modelName = selectedModelInfo.modelName;
            defaultDatasetStrategyConfig.modelConfigId = selectedModelInfo.id;
        }
        setQuestionConfig(defaultQuestionsStrategyConfig);
        setDatasetConfig(defaultDatasetStrategyConfig);
    };

    return (
        <div style={{ width: '100%', height: '800px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
            >
                <Controls />
                <MiniMap />
                <Background />

                <Panel position="top-right">
                    <div className="flex gap-2">
                        {/*<Button onClick={runWorkflow} disabled={isRunning}>*/}
                        {/*    {isRunning ? '执行中...' : '测试工作流'}*/}
                        {/*</Button>*/}
                        <Button onClick={handleReset}>重置</Button>
                        <Button onClick={handleSave}>保存</Button>
                        <SaveDialog open={open} setOpen={setOpen} formData={fromData} />
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}
