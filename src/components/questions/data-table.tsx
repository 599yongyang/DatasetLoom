import { type ColumnDef, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Fragment } from 'react';
import { Pagination } from '@/components/data-table/pagination';
import type { QuestionsDTO } from '@/server/db/schema/questions';
import { Separator } from '@/components/ui/separator';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { ModelTag } from '@lobehub/icons';
import { cn } from '@/lib/utils';
import axios from 'axios';
import type { DatasetSamples } from '@prisma/client';
import { toast } from 'sonner';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Tooltip } from '@/components/ui/tooltip';
import { Info, Trash2 } from 'lucide-react';
import { ConfirmAlert } from '@/components/common/confirm-alert';
import { ProjectRole } from 'src/server/db/types';
import { WithPermission } from '../common/permission-wrapper';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
    pagination: { pageIndex: number; pageSize: number };
    setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
    rowSelection?: Record<string, boolean>;
    setRowSelection?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    refresh: () => void;
}

export function DataTable<TData extends QuestionsDTO, TValue>({
    columns,
    data,
    pageCount,
    pagination,
    setPagination,
    rowSelection,
    setRowSelection,
    refresh
}: DataTableProps<TData, TValue>) {
    const router = useRouter();
    const { projectId }: { projectId: string } = useParams();
    const table = useReactTable({
        data,
        columns,
        getRowCanExpand: row => Boolean(row.original.DatasetSamples.length > 0),
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        manualPagination: true,
        pageCount,
        state: {
            rowSelection: rowSelection,
            pagination
        }
    });

    const handlePrimaryAnswer = (datasetSample: DatasetSamples) => {
        axios
            .put(`/api/project/${datasetSample.projectId}/datasets/primary-answer`, {
                dssId: datasetSample.id,
                questionId: datasetSample.questionId
            })
            .then(_ => {
                toast.success('设置成功');
                refresh();
            })
            .catch(error => {
                console.log(error);
                toast.error('设置失败');
            });
    };
    const deleteDataset = async (dataset: DatasetSamples, row: any) => {
        const res = await axios.delete(`/api/project/${dataset.projectId}/datasets/${dataset.id}`);
        if (res.status === 200) {
            toast.success('删除成功');
            void refresh();
            if (row.original.DatasetSamples.length == 0) {
                row.toggleExpanded();
            }
        } else {
            toast.error('删除失败，请重试');
        }
    };

    return (
        <div className="relative flex flex-col gap-4 pb-2 overflow-auto">
            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader className="bg-muted sticky top-0 z-10">
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map(header => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <Fragment key={row.id}>
                                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                        {row.getVisibleCells().map(cell => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {row.getIsExpanded() && (
                                        <TableRow>
                                            <TableCell colSpan={row.getVisibleCells().length}>
                                                <div className="px-4 bg-muted/50 rounded-lg border border-muted">
                                                    <div className="space-y-2">
                                                        {row.original.DatasetSamples.sort((a, b) => {
                                                            const aValue = a.isPrimaryAnswer ?? false;
                                                            const bValue = b.isPrimaryAnswer ?? false;
                                                            return (bValue ? 1 : 0) - (aValue ? 1 : 0);
                                                        }).map(dataset => (
                                                            <div
                                                                key={dataset.id}
                                                                className={cn(
                                                                    'group relative rounded-md  transition-colors',
                                                                    dataset.isPrimaryAnswer
                                                                        ? 'bg-primary/10 border border-primary/20'
                                                                        : 'hover:bg-muted/70'
                                                                )}
                                                            >
                                                                <div className="flex flex-1 justify-between items-center gap-4">
                                                                    {/* 左侧内容 */}
                                                                    <div
                                                                        className={cn(
                                                                            'flex items-center gap-2 flex-1 min-w-0',
                                                                            dataset.isPrimaryAnswer && 'p-2'
                                                                        )}
                                                                    >
                                                                        {dataset.isPrimaryAnswer && (
                                                                            <TooltipProvider delayDuration={0}>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Badge
                                                                                            className="mr-1"
                                                                                            variant="default"
                                                                                        >
                                                                                            主答案
                                                                                            <Info />
                                                                                        </Badge>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent className="px-2 py-1 text-xs">
                                                                                        <p>
                                                                                            该答案将作为优先训练样本用于
                                                                                            SFT 微调训练
                                                                                        </p>
                                                                                        <p>
                                                                                            避免多答案导致数据集权重分散
                                                                                        </p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>
                                                                        )}
                                                                        {!dataset.isPrimaryAnswer && (
                                                                            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                                                                                答案：
                                                                            </span>
                                                                        )}

                                                                        <div
                                                                            className={cn(
                                                                                'truncate max-w-[90vh] text-[12px] font-medium hover:underline hover:cursor-pointer text-left px-0',
                                                                                dataset.isPrimaryAnswer
                                                                                    ? 'text-primary font-semibold'
                                                                                    : 'text-foreground hover:text-primary'
                                                                            )}
                                                                            onClick={() =>
                                                                                router.push(
                                                                                    `/project/${dataset.projectId}/datasets/${dataset.questionId}?dssId=${dataset.id}`
                                                                                )
                                                                            }
                                                                        >
                                                                            {dataset.answer}
                                                                        </div>
                                                                        <ModelTag model={dataset.model} type="color" />
                                                                        <Badge variant={'secondary'}>
                                                                            置信度
                                                                            <span>{dataset.confidence * 100}%</span>
                                                                        </Badge>
                                                                    </div>

                                                                    {/* 右侧操作按钮 */}
                                                                    {!dataset.isPrimaryAnswer && (
                                                                        <WithPermission
                                                                            required={ProjectRole.EDITOR}
                                                                            projectId={projectId}
                                                                        >
                                                                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="whitespace-nowrap"
                                                                                    onClick={() =>
                                                                                        handlePrimaryAnswer(dataset)
                                                                                    }
                                                                                >
                                                                                    设为主答案
                                                                                </Button>
                                                                            </div>
                                                                        </WithPermission>
                                                                    )}
                                                                    <WithPermission
                                                                        required={ProjectRole.ADMIN}
                                                                        projectId={projectId}
                                                                    >
                                                                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                            <ConfirmAlert
                                                                                title={'确认要删除此数据集嘛？'}
                                                                                onConfirm={() =>
                                                                                    deleteDataset(dataset, row)
                                                                                }
                                                                            >
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className={
                                                                                        'text-red-500 hover:cursor-pointer hover:text-red-500'
                                                                                    }
                                                                                >
                                                                                    <Trash2 size={30} />
                                                                                </Button>
                                                                            </ConfirmAlert>
                                                                        </div>
                                                                    </WithPermission>
                                                                </div>
                                                                {!dataset.isPrimaryAnswer && (
                                                                    <Separator className="mt-3 group-last:hidden opacity-50" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <Pagination table={table} />
        </div>
    );
}
