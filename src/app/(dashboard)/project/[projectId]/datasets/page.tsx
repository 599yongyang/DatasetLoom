'use client';
import { type ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Eye, FileUp, MoreHorizontal, Star, ThumbsDown, ThumbsUp, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { type DatasetSamples } from '@prisma/client';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table/data-table';
import { ConfirmAlert } from '@/components/common/confirm-alert';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ExportDataDialog } from '@/components/dataset/export-data-dialog';
import { useDatasets } from '@/hooks/query/use-datasets';
import { ModelTag } from '@lobehub/icons';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/data-table/pagination';
import { useAtom } from 'jotai';
import { datasetViewModeAtom } from '@/atoms';
import { ProjectRole } from '@/schema/types';
import { WithPermission } from '@/components/common/permission-wrapper';

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
    const [viewMode, setViewMode] = useAtom(datasetViewModeAtom);
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
        input: searchQuery,
        type: viewMode,
        confirmed: filterConfirmed
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
            cell: ({ row }) => {
                const router = useRouter();
                const handleClick = () => {
                    router.push(
                        `/project/${row.original.projectId}/datasets/${row.original.questionId}?dssId=${row.original.id}`
                    );
                };
                return (
                    <div className={'flex items-center gap-2'}>
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
            accessorKey: 'confidence',
            header: t('table_columns.confidence'),
            cell: ({ row }) => <div>{row.original.confidence}</div>
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
                                `/project/${row.original.projectId}/datasets/${row.original.questionId}?dssId=${row.original.id}`
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

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="sticky top-0 z-10 bg-background/80 flex items-center justify-between gap-2">
                <div className={'flex gap-2 w-1/2'}>
                    <div className="group relative">
                        <label className="bg-background text-foreground absolute start-1 top-0 z-10 block -translate-y-1/2 px-2 text-xs font-medium group-has-disabled:opacity-50">
                            展示模式
                        </label>
                        <Select value={viewMode} onValueChange={value => setViewMode(value)}>
                            <SelectTrigger className="**:data-desc:hidden w-40">
                                <SelectValue placeholder="Choose a plan" />
                            </SelectTrigger>
                            <SelectContent className=" [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                                <SelectItem value="all">
                                    查看全部数据
                                    <span className="text-muted-foreground mt-1 block text-xs" data-desc>
                                        展示所有 QA 对
                                    </span>
                                </SelectItem>
                                <SelectItem value="sft">
                                    用于 SFT 训练
                                    <span className="text-muted-foreground mt-1 block text-xs" data-desc>
                                        只展示每个问题的首选答案
                                    </span>
                                </SelectItem>
                                <SelectItem value="pp">
                                    用于 DPO/KTO
                                    <span className="text-muted-foreground mt-1 block text-xs" data-desc>
                                        只展示已标注偏好的 QA 对
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

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
                    <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(true)}
                            className={'hover:cursor-pointer'}
                        >
                            <FileUp />
                            <span className="hidden lg:inline ">{t('export_btn')}</span>
                        </Button>
                        <ExportDataDialog open={dialogOpen} onOpenChange={setDialogOpen} />
                    </WithPermission>
                </div>
            </div>
            {viewMode === 'all' && (
                <DataTable
                    columns={columns}
                    data={datasets}
                    pageCount={pageCount}
                    pagination={pagination}
                    setPagination={setPagination}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                />
            )}

            {viewMode === 'sft' && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {datasets.map(item => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-lg leading-tight">
                                    <div
                                        className={' hover:cursor-pointer hover:underline'}
                                        onClick={() =>
                                            router.push(
                                                `/project/${projectId}/datasets/${item.questionId}?dssId=${item.id}`
                                            )
                                        }
                                    >
                                        {item.question}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm leading-relaxed">{item.answer}</CardDescription>
                                <div className=" gap-2 py-2">
                                    {item.referenceLabel.split(',').map((item, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {item}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className={'flex items-center gap-2'}>
                                        <Badge variant="default" className="text-xs">
                                            <Star className="w-3 h-3 mr-1" />
                                            主答案
                                        </Badge>
                                        <ModelTag model={item.model} type="color" />
                                    </div>

                                    <div className={'flex items-center'}>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </span>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {viewMode === 'pp' && (
                <div className="space-y-6">
                    {datasets.map((item: any) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xl leading-tight">
                                    <div
                                        className={' hover:cursor-pointer hover:underline'}
                                        onClick={() =>
                                            router.push(
                                                `/project/${projectId}/datasets/${item.questionId}?dssId=${item.datasetChosenId}`
                                            )
                                        }
                                    >
                                        {item.prompt}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* 偏好答案 */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <ThumbsUp className="w-4 h-4 text-green-600" />
                                            <span className="font-medium text-green-600">偏好答案</span>
                                        </div>
                                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                                            <p className="text-sm leading-relaxed">{item.chosen}</p>
                                        </div>
                                    </div>

                                    {/* 拒绝答案 */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <ThumbsDown className="w-4 h-4 text-red-600" />
                                            <span className="font-medium text-red-600">拒绝答案</span>
                                        </div>
                                        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                                            <p className="text-sm leading-relaxed">{item.rejected}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={'flex flex-1 justify-between items-center'}>
                                    <div className={'text-sm text-muted-foreground'}>
                                        {new Date(item.updatedAt).toLocaleString()}
                                    </div>

                                    <div className={'flex  mt-6 items-center'}>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {viewMode !== 'all' && (
                <Pagination
                    pagination={{
                        pageIndex: pagination.pageIndex,
                        pageSize: pagination.pageSize,
                        pageCount,
                        canPreviousPage: pagination.pageIndex > 0,
                        canNextPage: pagination.pageIndex < pageCount - 1,
                        gotoPage: page => setPagination(prev => ({ ...prev, pageIndex: page })),
                        previousPage: () => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 })),
                        nextPage: () => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 })),
                        setPageSize: size =>
                            setPagination(prev => ({
                                ...prev,
                                pageSize: size,
                                pageIndex: 0
                            }))
                    }}
                />
            )}
        </div>
    );
}
