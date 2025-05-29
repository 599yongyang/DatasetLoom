import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAtomValue } from 'jotai';
import { selectedModelInfoAtom } from '@/atoms';
import type { Questions } from '@prisma/client';
import { DatasetStrategyForm } from '@/components/dataset/dataset-strategy-form';
import { type DatasetStrategyParams, defaultDatasetStrategyConfig } from '@/types/dataset';
import { useGenerateDataset } from '@/hooks/use-generate-dataset';

export function DatasetStrategyDialog({
    type,
    open,
    setOpen,
    questions,
    mutateQuestions
}: {
    type: 'single' | 'multiple';
    open: boolean;
    setOpen: (open: boolean) => void;
    questions: Questions[];
    mutateQuestions: () => void;
}) {
    const { projectId }: { projectId: string } = useParams();
    const { generateSingleDataset, generateMultipleDataset } = useGenerateDataset();
    const model = useAtomValue(selectedModelInfoAtom);
    const [datasetStrategy, setDatasetStrategy] = useState<DatasetStrategyParams>({
        ...defaultDatasetStrategyConfig,
        modelConfigId: model.id,
        modelName: model.modelName,
        temperature: model.temperature,
        maxTokens: model.maxTokens
    });

    const handleGenerateDataset = async () => {
        if (type === 'single') {
            if (questions && questions[0])
                await generateSingleDataset({
                    projectId,
                    questionId: questions[0].id,
                    questionInfo: questions[0].question,
                    datasetStrategyParams: datasetStrategy
                });
        } else {
            await generateMultipleDataset(projectId, questions, datasetStrategy);
        }
        mutateQuestions();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">数据集生成配置</DialogTitle>
                    <div className="flex flex-col gap-4 overflow-y-auto p-4 text-sm">
                        <DatasetStrategyForm
                            type={'question'}
                            datasetStrategy={datasetStrategy}
                            setDatasetStrategy={setDatasetStrategy}
                        />
                    </div>
                </DialogHeader>
                <DialogFooter className="border-t px-6 py-4 sm:items-center">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            取消
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button type="button" onClick={handleGenerateDataset}>
                            生成
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
