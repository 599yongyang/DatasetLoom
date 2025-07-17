import type { ColumnDef } from '@tanstack/react-table';
import type { QuestionsDTO } from '@/server/db/schema/questions';
import { useTranslation } from 'react-i18next';
import { QuestionDialog } from '@/components/questions/question-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wand, SquarePen, ChevronUpIcon, ChevronDownIcon, ChevronRight, Drama } from 'lucide-react';
import { ConfirmAlert } from '@/components/common/confirm-alert';
import axios from 'axios';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { useParams } from 'next/navigation';
import { DatasetStrategyDialog } from '@/components/dataset/dataset-strategy-dialog';
import React, { useState } from 'react';
import { PreferencePairDialog } from '@/components/preference-pair/preference-pair-dialog';
import { ProjectRole, QuestionContextType } from 'src/server/db/types';
import { WithPermission } from '../common/permission-wrapper';
import MentionsTextarea from '@/components/ui/mentions-textarea';
import { type QuestionType, questionTypeMap } from '@/lib/data-dictionary';
import { useGenerateDataset } from '@/hooks/use-generate-dataset';
import { useAtomValue } from 'jotai/index';
import { selectedModelInfoAtom } from '@/atoms';
import { type DatasetStrategyParams, defaultDatasetStrategyConfig } from '@/types/dataset';

export function useQuestionTableColumns({ mutateQuestions }: { mutateQuestions: () => void }) {
    const { t } = useTranslation('question');
    const { projectId }: { projectId: string } = useParams();
    const { generateSingleDataset } = useGenerateDataset();
    const model = useAtomValue(selectedModelInfoAtom);
    const deleteQuestion = (questionId: string) => {
        toast.promise(axios.delete(`/api/project/${projectId}/questions/${questionId}`), {
            loading: '删除中...',
            success: () => {
                mutateQuestions();
                return '删除成功';
            },
            error: e => e.response?.data?.message || '删除失败'
        });
    };
    const [open, setOpen] = useState(false);

    const genAnswer = async (question: QuestionsDTO) => {
        if (question.contextType === QuestionContextType.IMAGE) {
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
        } else {
            setOpen(true);
        }
    };

    const columns: ColumnDef<QuestionsDTO>[] = [
        {
            id: 'expander',
            header: () => null,
            cell: ({ row }) => {
                return row.getCanExpand() ? (
                    <Button
                        {...{
                            className: 'size-7 -mr-4 shadow-none text-muted-foreground',
                            onClick: row.getToggleExpandedHandler(),
                            'aria-expanded': row.getIsExpanded(),
                            'aria-label': row.getIsExpanded()
                                ? `Collapse details for ${row.original.label}`
                                : `Expand details for ${row.original.label}`,
                            size: 'icon',
                            variant: 'ghost'
                        }}
                    >
                        {row.getIsExpanded() ? (
                            <ChevronDownIcon className="opacity-60" size={16} aria-hidden="true" />
                        ) : (
                            <ChevronRight className="opacity-60" size={16} aria-hidden="true" />
                        )}
                    </Button>
                ) : undefined;
            }
        },
        {
            id: 'select',
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={value => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
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
                    {questionTypeMap[row.original.contextType as QuestionType]}
                </Badge>
            )
        },
        {
            accessorKey: 'label',
            header: t('table_columns.label'),
            cell: ({ row }) => (
                <div className={'flex flex-wrap gap-2'}>
                    {row.original.label
                        ?.split(',')
                        ?.filter((tag: string) => tag.trim()) // 过滤掉空字符串
                        ?.map((tag: string) => (
                            <Badge key={tag.trim()} variant="outline" className="text-muted-foreground ">
                                {tag.trim()}
                            </Badge>
                        ))}
                </div>
            ),
            enableHiding: false
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
            cell: ({ row }) => {
                const [ppOpen, setPpOpen] = useState(false);
                return (
                    <div className="flex flex-1 justify-center gap-2">
                        <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                            <QuestionDialog item={row.original} getQuestions={mutateQuestions}>
                                <Button variant="ghost" size="icon" aria-label="View">
                                    <SquarePen size={30} />
                                </Button>
                            </QuestionDialog>
                            <Button variant="ghost" size="icon" onClick={() => genAnswer(row.original)}>
                                <Wand size={30} />
                            </Button>

                            {open && (
                                <DatasetStrategyDialog
                                    type={'single'}
                                    questions={[row.original]}
                                    open={open}
                                    setOpen={setOpen}
                                    mutateQuestions={mutateQuestions}
                                />
                            )}
                            {row.original.DatasetSamples.length > 1 && (
                                <Button variant="ghost" size="icon" onClick={() => setPpOpen(true)}>
                                    <Drama size={30} />
                                </Button>
                            )}
                            {ppOpen && (
                                <PreferencePairDialog questionId={row.original.id} open={ppOpen} setOpen={setPpOpen} />
                            )}
                        </WithPermission>
                        <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                            <ConfirmAlert
                                title={t('delete_title')}
                                message={row.original.question}
                                onConfirm={() => deleteQuestion(row.original.id)}
                            />
                        </WithPermission>
                    </div>
                );
            }
        }
    ];

    return columns;
}
