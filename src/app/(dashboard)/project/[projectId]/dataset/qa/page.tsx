'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUp, MoreHorizontal, Star, ThumbsDown, ThumbsUp, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table/data-table';
import { useTranslation } from 'react-i18next';
import { ExportDataDialog } from '@/components/dataset/export-data-dialog';
import { useDatasets } from '@/hooks/query/use-datasets';
import { ModelTag } from '@lobehub/icons';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/data-table/pagination';
import { useAtom } from 'jotai';
import { datasetViewModeAtom } from '@/atoms';
import { ProjectRole } from '@/server/db/types';
import { WithPermission } from '@/components/common/permission-wrapper';
import { useDatasetTableColumns } from '@/hooks/table-columns/use-dataset';
import MentionsTextarea from '@/components/ui/mentions-textarea';
import { ContextTypeMap } from '@/lib/data-dictionary';

export default function Page() {
    const router = useRouter();
    const { t } = useTranslation('dataset');
    const { projectId } = useParams<{ projectId: string }>();
    const [filterConfirmed, setFilterConfirmed] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [contextType, setContextType] = useState('all');
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
        confirmed: filterConfirmed,
        contextType
    });

    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const columns = useDatasetTableColumns({ mutateDatasets });

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="sticky top-0 z-10 bg-background/80 flex items-center justify-between gap-2">
                <div className={'flex gap-2'}>
                    <div className="group relative">
                        <label className="bg-background text-foreground absolute start-1 top-0 z-10 block -translate-y-1/2 px-2 text-xs font-medium group-has-disabled:opacity-50">
                            分类
                        </label>
                        <Select
                            value={contextType}
                            onValueChange={value => {
                                setContextType(value);
                                setPagination({ ...pagination, pageIndex: 0 });
                            }}
                        >
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="状态" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">全部</SelectItem>
                                {Object.entries(ContextTypeMap).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
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
                    <div className="group relative">
                        <label className="bg-background text-foreground absolute start-1 top-0 z-10 block -translate-y-1/2 px-2 text-xs font-medium group-has-disabled:opacity-50">
                            状态
                        </label>
                        <Select
                            value={filterConfirmed}
                            onValueChange={value => {
                                setFilterConfirmed(value);
                                setPagination({ ...pagination, pageIndex: 0 });
                            }}
                        >
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="状态" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('select_item.all')}</SelectItem>
                                <SelectItem value="confirmed">{t('select_item.confirmed')}</SelectItem>
                                <SelectItem value="unconfirmed">{t('select_item.unconfirmed')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Input
                        className="w-60"
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            setPagination({ ...pagination, pageIndex: 0 });
                        }}
                        placeholder={t('search')}
                    />
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
                                        onClick={() =>
                                            router.push(
                                                `/project/${projectId}/dataset/qa/${item.questionId}?dssId=${item.id}`
                                            )
                                        }
                                    >
                                        <MentionsTextarea value={item.question} readOnly cursor={'pointer'} />
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm leading-relaxed">{item.answer}</CardDescription>
                                <div className="gap-2 space-x-2 py-2 flex flex-wrap">
                                    {item.referenceLabel !== '' &&
                                        item.referenceLabel?.split(',').map((label, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="text-xs whitespace-nowrap"
                                            >
                                                {label}
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
                                                `/project/${projectId}/dataset/qa/${item.questionId}?dssId=${item.datasetChosenId}`
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
