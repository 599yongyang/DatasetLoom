import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Check, X, Eye, Trash2 } from 'lucide-react';
import { ConfirmAlert } from '@/components/common/confirm-alert';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { ProjectRole } from '@repo/shared-types';
import { WithPermission } from '@/components/common/permission-wrapper';
import type { DatasetSamples } from '@/types/interfaces/dataset';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ModelTag } from '@lobehub/icons';
import MentionsTextarea from '@/components/ui/mentions-textarea';
import apiClient from '@/lib/axios';

export function useDatasetTableColumns({ mutateDatasets }: { mutateDatasets: () => void }) {
    const { t } = useTranslation('dataset');
    const router = useRouter();
    const { projectId }: { projectId: string } = useParams();

    const deleteDataset = async (id: string) => {
        const res = await apiClient.delete(`/${projectId}/qa-dataset/delete?ids=${id}`);
        if (res.status === 200) {
            toast.success('删除成功');
            void mutateDatasets();
        } else {
            toast.error('删除失败，请重试');
        }
    };

    const columns: ColumnDef<DatasetSamples>[] = [
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
            cell: ({ row }) => (
                <MentionsTextarea value={row.original.question} className={'hover:cursor-pointer'} readOnly />
            ),
            enableHiding: false
        },
        {
            accessorKey: 'answer',
            header: t('table_columns.answer'),
            cell: ({ row }) => (
                <div className="w-100 truncate">
                    <HoverCard>
                        <HoverCardTrigger className={'w-4 truncate'}>{row.original.answer}</HoverCardTrigger>
                        <HoverCardContent className={'max-h-52 overflow-auto'}>{row.original.answer}</HoverCardContent>
                    </HoverCard>
                </div>
            )
        },
        {
            accessorKey: 'cot',
            header: t('table_columns.cot'),
            cell: ({ row }) => (
                <>
                    {row.original.cot !== '' ? (
                        <Check size={28} className={'text-green-500'} />
                    ) : (
                        <X className={'text-red-500'} size={28} />
                    )}
                </>
            )
        },
        {
            accessorKey: 'model',
            header: t('table_columns.model'),
            cell: ({ row }) => (
                <div>
                    <ModelTag model={row.original.model} type="color" />
                </div>
            )
        },
        {
            accessorKey: 'confidence',
            header: t('table_columns.confidence'),
            cell: ({ row }) => <div>{row.original.confidence * 100}%</div>
        },
        {
            accessorKey: 'isPrimaryAnswer',
            header: t('table_columns.isPrimaryAnswer'),
            cell: ({ row }) => (
                <>
                    {row.original.isPrimaryAnswer ? (
                        <Check size={28} className={'text-green-500'} />
                    ) : (
                        <X className={'text-red-500'} size={28} />
                    )}
                </>
            )
        },
        {
            accessorKey: 'createdAt',
            header: t('table_columns.createdAt'),
            cell: ({ row }) => <div className="w-32">{new Date(row.original.createdAt).toLocaleString('zh-CN')}</div>
        },
        {
            id: 'actions',
            header: () => <div className="w-full text-center">{t('table_columns.actions')}</div>,
            cell: ({ row }) => (
                <div className={'flex flex-1'}>
                    <Button
                        variant="ghost"
                        onClick={() =>
                            router.push(
                                `/project/${row.original.projectId}/dataset/qa/${row.original.questionId}?dssId=${row.original.id}`
                            )
                        }
                        className={'hover:cursor-pointer'}
                        size="icon"
                    >
                        <Eye size={30} />
                    </Button>
                    <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                        <ConfirmAlert title={'确认要删除此数据集嘛？'} onConfirm={() => deleteDataset(row.original.id)}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={'text-red-500 hover:cursor-pointer hover:text-red-500'}
                            >
                                <Trash2 size={30} />
                            </Button>
                        </ConfirmAlert>
                    </WithPermission>
                </div>
            )
        }
    ];

    return columns;
}
