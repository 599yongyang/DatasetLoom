import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import { useEffect, useState } from 'react';
import type { WorkflowStep } from '@prisma/client';
import {
    Timeline,
    TimelineContent,
    TimelineDate,
    TimelineHeader,
    TimelineIndicator,
    TimelineItem,
    TimelineSeparator,
    TimelineTitle
} from '@/components/ui/timeline';
import { CheckIcon, AlertCircle, Loader2 } from 'lucide-react';
import { WorkflowStatus } from '@/lib/data-dictionary';

interface WorkflowData {
    id: string;
    name: string;
    steps: WorkflowStep[];
    status: WorkflowStatus;
}

export default function StepLog({
    openLog,
    setOpenLog,
    workflowId,
    projectId
}: {
    openLog: boolean;
    setOpenLog: (openLog: boolean) => void;
    workflowId: string;
    projectId: string;
}) {
    const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getWorkflow = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.get(`/api/project/${projectId}/workflow/${workflowId}`);
            setWorkflow(res.data);
        } catch (err) {
            console.error('Failed to fetch workflow:', err);
            setError('加载工作流失败');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (openLog && workflowId) {
            void getWorkflow();
        }
    }, [openLog, workflowId]);

    // 获取当前正在执行的步骤
    const getCurrentStep = () => {
        if (!workflow?.steps?.length) return null;

        const failedStep = workflow.steps.find(step => step.status === WorkflowStatus.FAILED);
        if (failedStep) return failedStep;

        const runningStep = workflow.steps.find(step => step.status === WorkflowStatus.RUNNING);
        if (runningStep) return runningStep;

        const allCompleted = workflow.steps.every(step => step.status === WorkflowStatus.COMPLETE);
        if (allCompleted) return workflow.steps[workflow.steps.length - 1];

        return workflow.steps.find(step => step.status === WorkflowStatus.WAITING);
    };

    const currentStep = getCurrentStep();
    return (
        <Dialog open={openLog} onOpenChange={setOpenLog}>
            <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">节点执行日志</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center p-6">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-500">{error}</div>
                    ) : !workflow || !workflow.steps?.length ? (
                        <div className="p-4 text-center text-gray-500">暂无步骤信息</div>
                    ) : (
                        <Timeline
                            className="p-3"
                            value={
                                currentStep?.sort && currentStep.status !== WorkflowStatus.WAITING
                                    ? currentStep?.sort
                                    : 0
                            }
                        >
                            {workflow.steps.map(item => {
                                let statusText = '';
                                let icon = null;

                                switch (item.status) {
                                    case WorkflowStatus.COMPLETE:
                                        statusText = '完成';
                                        icon = <CheckIcon className="size-4 text-green-500" />;
                                        break;
                                    case WorkflowStatus.FAILED:
                                        statusText = '失败';
                                        icon = <AlertCircle className="size-4 text-red-500" />;
                                        break;
                                    case WorkflowStatus.RUNNING:
                                        statusText = '运行中...';
                                        icon = <Loader2 className="size-4 animate-spin text-blue-500" />;
                                        break;
                                    default:
                                        statusText = '等待执行';
                                        icon = <div className="size-4 rounded-full border border-gray-300" />;
                                }

                                return (
                                    <TimelineItem
                                        key={item.id}
                                        step={item.sort}
                                        className="group-data-[orientation=vertical]/timeline:ms-10"
                                        data-active={currentStep?.id === item.id}
                                        data-status={item.status}
                                    >
                                        <TimelineHeader>
                                            <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />
                                            <div className={'flex flex-1 justify-between items-center '}>
                                                <TimelineTitle>{item.name}</TimelineTitle>
                                                {item.finishedAt && (
                                                    <TimelineDate>
                                                        {new Date(item.finishedAt).toLocaleString()}
                                                    </TimelineDate>
                                                )}
                                            </div>
                                            <TimelineIndicator className="flex size-6 items-center justify-center group-data-[orientation=vertical]/timeline:-left-7">
                                                {icon}
                                            </TimelineIndicator>
                                        </TimelineHeader>

                                        <TimelineContent className={'max-h-700'}>
                                            <div className="text-gray-500">{statusText}</div>
                                            {item.logs && <div className="mt-1 text-xs text-gray-500">{item.logs}</div>}
                                        </TimelineContent>
                                    </TimelineItem>
                                );
                            })}
                        </Timeline>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
