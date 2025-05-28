import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetPreferencePair } from '@/hooks/query/use-preferencePair';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

export function PreferencePairDialog({
    open,
    setOpen,
    questionId
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    questionId: string;
}) {
    const { projectId }: { projectId: string } = useParams();

    const { data: preferencePair, isLoading } = useGetPreferencePair(projectId, questionId);

    const handleSubmit = async (preferenceIndex: 0 | 1) => {
        if (!preferencePair || !preferencePair[0] || !preferencePair[1]) {
            toast.error('数据不完整，请重试');
            return;
        }

        const chosenOption = preferencePair[preferenceIndex];
        const rejectedOption = preferencePair[preferenceIndex === 0 ? 1 : 0];

        const payload = {
            projectId,
            questionId,
            prompt: preferencePair[0].question,
            chosen: chosenOption?.answer,
            rejected: rejectedOption?.answer,
            datasetChosenId: chosenOption?.id,
            datasetRejectId: rejectedOption?.id
        };

        try {
            await axios.post(`/api/project/${projectId}/preference-pair`, payload);
            toast.success('标注成功');
            setOpen(false);
        } catch (error) {
            toast.error('标注失败');
        }
    };

    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <div className="p-6">加载中...</div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!preferencePair || !preferencePair.length) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <div className="p-6 text-center text-muted-foreground">没有可用的数据</div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="flex h-auto max-h-[80vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
                <DialogHeader className="border-b px-6 py-4">
                    <DialogTitle className="text-base font-semibold">
                        数据集偏好标注
                        <p className={'text-[12px] text-muted-foreground'}>该决策将作为DPO数据集微调训练</p>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                    <div className="text-center text-lg font-medium text-foreground">{preferencePair[0]?.question}</div>

                    <div className="grid grid-cols-2 gap-4">
                        {preferencePair.map((item, index) => (
                            <div
                                key={item.id}
                                className="group relative rounded-lg border p-4 transition-colors hover:bg-muted/50"
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="text-sm font-medium">选项{String.fromCharCode(65 + index)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground ">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter className="flex gap-4 border-t px-6 py-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 hover:bg-secondary/80"
                        onClick={() => handleSubmit(0)}
                    >
                        偏向A
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 hover:bg-secondary/80"
                        onClick={() => handleSubmit(1)}
                    >
                        偏向B
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
