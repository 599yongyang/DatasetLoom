import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAtomValue } from 'jotai';
import { selectedModelInfoAtom } from '@/atoms';
import { type SelectedChunk, useGenerateQuestion } from '@/hooks/use-generate-question';
import { QuestionStrategyForm } from '@/components/questions/question-strategy-form';
import { defaultQuestionsStrategyConfig } from '@/types/question';

export function QuestionStrategyDialog({
    open,
    setOpen,
    chunks,
    mutateChunks
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    chunks: SelectedChunk[];
    mutateChunks: () => void;
}) {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('question');

    const model = useAtomValue(selectedModelInfoAtom);
    const { generateSingleQuestion, generateMultipleQuestion } = useGenerateQuestion();

    const [questionStrategy, setQuestionStrategy] = useState({
        ...defaultQuestionsStrategyConfig,
        modelConfigId: model.id,
        modelName: model.modelName,
        temperature: model.temperature,
        maxTokens: model.maxTokens
    });
    const handleGenerateQuestion = async () => {
        if (chunks.length === 1 && chunks[0]) {
            await generateSingleQuestion({
                projectId,
                contextId: chunks[0].id,
                fileName: chunks[0].name,
                questionStrategy
            });
        } else {
            await generateMultipleQuestion(projectId, chunks, questionStrategy);
        }
        mutateChunks();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">{t('strategy_dialog_title')}</DialogTitle>
                    <div className="flex flex-col overflow-y-auto px-4 text-sm">
                        <QuestionStrategyForm
                            type={'chunk'}
                            questionStrategy={questionStrategy}
                            setQuestionStrategy={setQuestionStrategy}
                        />
                    </div>
                </DialogHeader>
                <DialogFooter className="border-t px-6 py-4 sm:items-center">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            {t('cancel_btn')}
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button type="button" onClick={handleGenerateQuestion}>
                            {t('confirm_btn')}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
