'use client';
import { type ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, CheckCircle2Icon, Eye, FileUp, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Datasets } from '@prisma/client';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table/data-table';
import { ConfirmAlert } from '@/components/confirm-alert';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ExportDataDialog } from '@/components/dataset/export-data-dialog';
import { useDatasets } from '@/hooks/query/use-datasets';
import { ModelTag } from '@lobehub/icons';
import * as React from 'react';

export default function Page() {
    const router = useRouter();
    const { t } = useTranslation('dataset');
    const { projectId } = useParams<{ projectId: string }>();
    const [filterConfirmed, setFilterConfirmed] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });
    const [rowSelection, setRowSelection] = useState({});
    const [dialogOpen, setDialogOpen] = useState(false);

    const {
        datasets,
        total,
        confirmedCount,
        refresh: mutateDatasets
    } = useDatasets({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        status: filterConfirmed,
        input: searchQuery
    });

    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const deleteDataset = async (id: string) => {
        const res = await axios.delete(`/api/project/${projectId}/datasets/${id}`);
        if (res.status === 200) {
            toast.success('删除成功');
            void mutateDatasets();
        } else {
            toast.error('删除失败，请重试');
        }
    };
    const columns: ColumnDef<Datasets>[] = [
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
            cell: ({ row }) => {
                const router = useRouter();
                const handleClick = () => {
                    router.push(`/project/${row.original.projectId}/datasets/${row.original.id}`);
                };
                return (
                    <div className={'flex items-center gap-2'}>
                        {row.original.confirmed && (
                            <Badge variant="outline" className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3">
                                <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
                                已确认
                            </Badge>
                        )}
                        <Button
                            variant="link"
                            onClick={handleClick}
                            className="text-foreground w-fit px-0 text-left hover:cursor-pointer"
                        >
                            {row.original.question}
                        </Button>
                    </div>
                );
            },
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
                        onClick={() => router.push(`/project/${row.original.projectId}/datasets/${row.original.id}`)}
                        className={'hover:cursor-pointer'}
                        size="icon"
                    >
                        <Eye size={30} />
                    </Button>
                    <ConfirmAlert title={'确认要删除此数据集嘛？'} onConfirm={() => deleteDataset(row.original.id)}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={'text-red-500 hover:cursor-pointer hover:text-red-500'}
                        >
                            <Trash2 size={30} />
                        </Button>
                    </ConfirmAlert>
                </div>
            )
        }
    ];

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="sticky top-0 z-10 bg-background/80 flex items-center justify-between gap-2">
                <div className={'flex gap-2 w-1/2'}>
                    <Input
                        className="w-1/3"
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            setPagination({ ...pagination, pageIndex: 0 });
                        }}
                        placeholder={t('search')}
                    />
                    <Select
                        value={filterConfirmed}
                        onValueChange={value => {
                            setFilterConfirmed(value);
                            setPagination({ ...pagination, pageIndex: 0 });
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="状态" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('select_item.all')}</SelectItem>
                            <SelectItem value="confirmed">{t('select_item.confirmed')}</SelectItem>
                            <SelectItem value="unconfirmed">{t('select_item.unconfirmed')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className={'flex items-center'}>
                    <span className={'text-muted-foreground text-sm'}>
                        {t('info', {
                            total,
                            confirmedCount
                        })}{' '}
                        （{total == 0 ? 0 : ((confirmedCount / total) * 100).toFixed(2)}%）
                    </span>
                    <Button variant="outline" onClick={() => setDialogOpen(true)} className={'hover:cursor-pointer'}>
                        <FileUp />
                        <span className="hidden lg:inline ">{t('export_btn')}</span>
                    </Button>
                    <ExportDataDialog open={dialogOpen} onOpenChange={setDialogOpen} />
                </div>
            </div>
            <DataTable
                columns={columns}
                data={datasets}
                pageCount={pageCount}
                pagination={pagination}
                setPagination={setPagination}
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
            />
        </div>
    );
}
