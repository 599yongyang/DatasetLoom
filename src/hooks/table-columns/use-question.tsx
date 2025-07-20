import type { ColumnDef } from '@tanstack/react-table';
import type { QuestionsDTO } from '@/server/db/schema/questions';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import MentionsTextarea from '@/components/ui/mentions-textarea';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { ContextType, ProjectRole } from 'src/server/db/types';
import { useAtomValue } from 'jotai/index';
import { selectedModelInfoAtom } from '@/atoms';
import { useGenerateDataset } from '@/hooks/use-generate-dataset';
import type { DatasetStrategyParams } from '@/types/dataset';
import { WithPermission } from '@/components/common/permission-wrapper';
import { QuestionDialog } from '@/components/questions/question-dialog';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronRight, Drama, SquarePen, Wand } from 'lucide-react';
import { ConfirmAlert } from '@/components/common/confirm-alert';
import { DatasetStrategyDialog } from '@/components/dataset/dataset-strategy-dialog';
import { PreferencePairDialog } from '@/components/preference-pair/preference-pair-dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { ContextTypeMap, type UIContextType } from '@/lib/data-dictionary';

export function useQuestionTableColumns({ mutateQuestions }: { mutateQuestions: () => void }) {
    const { t } = useTranslation('question');
    const { projectId }: { projectId: string } = useParams();

    const columns: ColumnDef<QuestionsDTO>[] = [
        {
            id: 'expander',
            header: () => null,
            cell: ({ row }) => {
                return row.getCanExpand() ? (
                    <button
                        className="size-7 -mr-4 text-muted-foreground"
                        onClick={row.getToggleExpandedHandler()}
                        aria-expanded={row.getIsExpanded()}
                    >
                        {row.getIsExpanded() ? (
                            <ChevronDownIcon className="opacity-60" size={16} aria-hidden="true" />
                        ) : (
                            <ChevronRight className="opacity-60" size={16} aria-hidden="true" />
                        )}
                    </button>
                ) : null;
            }
        },
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={value => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableHiding: false
        },
        {
            accessorKey: 'question',
            header: t('table_columns.question'),
            cell: ({ row }) => <MentionsTextarea value={row.original.question} readOnly />,
            enableHiding: false
        },
        {
            accessorKey: 'type',
            header: t('table_columns.type'),
            cell: ({ row }) => (
                <Badge variant="outline" className="text-muted-foreground">
                    {ContextTypeMap[row.original.contextType as UIContextType]}
                </Badge>
            )
        },
        {
            accessorKey: 'label',
            header: t('table_columns.label'),
            cell: ({ row }) => {
                const tags = row.original.label
                    ?.split(',')
                    .map(tag => tag.trim())
                    .filter(Boolean);
                return (
                    <div className="flex flex-wrap gap-2">
                        {tags?.map(tag => (
                            <Badge key={tag} variant="outline" className="text-muted-foreground">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                );
            }
        },
        {
            accessorKey: 'chunk',
            header: t('table_columns.chunk'),
            cell: ({ row }) => (
                <Badge variant="outline" className="text-muted-foreground">
                    {row.original.contextName}
                </Badge>
            )
        },
        {
            accessorKey: 'createdAt',
            header: t('table_columns.createdAt'),
            cell: ({ row }) => <div className="w-32">{new Date(row.original.createdAt).toLocaleString('zh-CN')}</div>
        },
        {
            id: 'actions',
            header: () => <div className="text-center">{t('table_columns.actions')}</div>,
            cell: ({ row }) => (
                <ActionCell question={row.original} projectId={projectId} mutateQuestions={mutateQuestions} />
            )
        }
    ];

    return columns;
}

interface ActionCellProps {
    question: QuestionsDTO;
    projectId: string;
    mutateQuestions: () => void;
}

function ActionCell({ question, projectId, mutateQuestions }: ActionCellProps) {
    const [ppOpen, setPpOpen] = useState(false);
    const [dsOpen, setDsOpen] = useState(false);
    const model = useAtomValue(selectedModelInfoAtom);
    const { generateSingleDataset } = useGenerateDataset();

    const handleGenAnswer = async () => {
        if (question.contextType === ContextType.IMAGE) {
            await generateSingleDataset({
                projectId,
                questionId: question.id,
                questionInfo: question.question,
                datasetStrategyParams: {
                    modelConfigId: model.id,
                    modelName: model.modelName,
                    temperature: model.temperature,
                    maxTokens: model.maxTokens
                } as DatasetStrategyParams
            });
            mutateQuestions();
        } else {
            setDsOpen(true);
        }
    };

    return (
        <>
            <div className="flex flex-1 justify-center gap-2">
                <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                    {question.contextType === ContextType.TEXT && (
                        <QuestionDialog item={question} getQuestions={mutateQuestions}>
                            <Button variant="ghost" size="icon" aria-label="Edit">
                                <SquarePen size={30} />
                            </Button>
                        </QuestionDialog>
                    )}

                    <Button variant="ghost" size="icon" onClick={handleGenAnswer} aria-label="Generate Answer">
                        <Wand size={30} />
                    </Button>

                    {question.DatasetSamples.length > 1 && question.contextType === ContextType.TEXT && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPpOpen(true)}
                            aria-label="Create Preference Pair"
                        >
                            <Drama size={30} />
                        </Button>
                    )}
                </WithPermission>

                <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                    <ConfirmAlert
                        title="确认删除"
                        message={question.question}
                        onConfirm={() => deleteQuestion(question.id, projectId, mutateQuestions)}
                    />
                </WithPermission>
            </div>

            {dsOpen && (
                <DatasetStrategyDialog
                    type="single"
                    questions={[question]}
                    open={dsOpen}
                    setOpen={setDsOpen}
                    mutateQuestions={mutateQuestions}
                />
            )}

            {ppOpen && <PreferencePairDialog questionId={question.id} open={ppOpen} setOpen={setPpOpen} />}
        </>
    );
}

function deleteQuestion(questionId: string, projectId: string, mutateQuestions: () => void) {
    toast.promise(axios.delete(`/api/project/${projectId}/questions/${questionId}`), {
        loading: '删除中...',
        success: () => {
            mutateQuestions();
            return '删除成功';
        },
        error: e => e.response?.data?.message || '删除失败'
    });
}
