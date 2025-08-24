import type { ColumnDef } from '@tanstack/react-table';
import { Questions, QuestionsWithDatasetSample } from '@/types/interfaces';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import MentionsTextarea from '@/components/ui/mentions-textarea';
import { useParams } from 'next/navigation';
import React from 'react';
import { ProjectRole } from '@repo/shared-types';
import { WithPermission } from '@/components/common/permission-wrapper';
import { QuestionDialog } from '@/components/questions/question-dialog';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronRight, Drama, SquarePen, Wand } from 'lucide-react';
import { ConfirmAlert } from '@/components/common/confirm-alert';
import { ContextTypeMap, type UIContextType } from '@/constants/data-dictionary';
import { useDelete } from '@/hooks/use-delete';

export function useQuestionTableColumns({ refresh, onOpenDialog, onOpenPPDialog }: {
    refresh: () => void,
    onOpenDialog: (questions: Questions) => void;
    onOpenPPDialog: (questionId: string) => void;
}) {
    const { t } = useTranslation('question');
    const { projectId }: { projectId: string } = useParams();
    const { deleteItems } = useDelete();
    const handleDelete = async (id: string) => {
        await deleteItems(`/${projectId}/question/delete`, [id], { onSuccess: refresh });
    };
    const columns: ColumnDef<QuestionsWithDatasetSample>[] = [
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
                <div className="flex flex-1 justify-center gap-2">
                    <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                        <Button variant="ghost" size="icon" onClick={() => onOpenDialog(row.original)}
                                aria-label="Generate Answer">
                            <Wand size={30} />
                        </Button>
                        {row.original.DatasetSamples.length > 1 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onOpenPPDialog(row.original.id)}
                                aria-label="Create Preference Pair"
                            >
                                <Drama size={30} />
                            </Button>
                        )}
                        <QuestionDialog item={row.original} refresh={refresh}>
                            <Button variant="ghost" size="icon" aria-label="Edit">
                                <SquarePen size={30} />
                            </Button>
                        </QuestionDialog>
                    </WithPermission>

                    <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                        <ConfirmAlert
                            title="确认删除"
                            message={row.original.question}
                            onConfirm={() => handleDelete(row.original.id)}
                        />
                    </WithPermission>
                </div>
            )
        }
    ];
    return columns;
}
