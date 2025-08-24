'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table/data-table';
import { useTranslation } from 'react-i18next';
import { ExportDataDialog } from '@/components/dataset/export-data-dialog';
import * as React from 'react';
import { useAtom } from 'jotai';
import { datasetViewModeAtom } from '@/atoms';
import { ProjectRole } from '@repo/shared-types';
import { WithPermission } from '@/components/common/permission-wrapper';
import { ContextTypeMap } from '@/constants/data-dictionary';
import { usePagination } from '@/hooks/use-pagination';
import { useQADatasetList } from '@/hooks/query/use-qa-dataset';
import { useDatasetTableColumns } from '@/hooks/table-columns/use-qa-dataset';
import DpoModeTable from '@/components/dataset/dpo-mode-table';
import SftModeTable from '@/components/dataset/sft-mode-table';
import PaginationC from '@/components/ui/pagination';

export default function Page() {
    const { t } = useTranslation('dataset');
    const { projectId } = useParams<{ projectId: string }>();
    const [filterConfirmed, setFilterConfirmed] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [contextType, setContextType] = useState('all');
    const { pagination, setPagination } = usePagination({
        defaultPageSize: 10,
        resetDeps: [contextType, searchQuery, filterConfirmed]
    });
    const [rowSelection, setRowSelection] = useState({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [showType, setShowType] = useAtom(datasetViewModeAtom);
    const { datasets, total, confirmedCount, refresh } = useQADatasetList({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        status: filterConfirmed,
        query: searchQuery,
        showType: showType,
        confirmed: filterConfirmed,
        contextType
    });

    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const columns = useDatasetTableColumns({ refresh });

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="sticky top-0 z-10 bg-background/80 flex items-center justify-between gap-2">
                <div className={'flex gap-2'}>
                    <div className="group relative">
                        <label
                            className="bg-background text-foreground absolute start-1 top-0 z-10 block -translate-y-1/2 px-2 text-xs font-medium group-has-disabled:opacity-50">
                            {t('query_show_item.title')}
                        </label>
                        <Select value={showType} onValueChange={value => setShowType(value)}>
                            <SelectTrigger className="**:data-desc:hidden w-40">
                                <SelectValue placeholder="Choose a plan" />
                            </SelectTrigger>
                            <SelectContent
                                className=" [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                                <SelectItem value="all">
                                    {t('query_show_item.raw')}
                                    <span className="text-muted-foreground mt-1 block text-xs"
                                          data-desc={t('query_show_item.raw_desc')}>
                                        {t('query_show_item.raw_desc')}
                                    </span>
                                </SelectItem>
                                <SelectItem value="sft">
                                    {t('query_show_item.sft')}
                                    <span className="text-muted-foreground mt-1 block text-xs"
                                          data-desc={t('query_show_item.sft_desc')}>
                                        {t('query_show_item.sft_desc')}
                                    </span>
                                </SelectItem>
                                <SelectItem value="dpo">
                                    {t('query_show_item.dpo')}
                                    <span className="text-muted-foreground mt-1 block text-xs"
                                          data-desc={t('query_show_item.dpo_desc')}>
                                        {t('query_show_item.dpo_desc')}
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="group relative">
                        <label
                            className="bg-background text-foreground absolute start-1 top-0 z-10 block -translate-y-1/2 px-2 text-xs font-medium group-has-disabled:opacity-50">
                            分类
                        </label>
                        <Select
                            value={contextType}
                            onValueChange={value => setContextType(value)}
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
                        <label
                            className="bg-background text-foreground absolute start-1 top-0 z-10 block -translate-y-1/2 px-2 text-xs font-medium group-has-disabled:opacity-50">
                            {t('query_state_item.title')}
                        </label>
                        <Select
                            value={filterConfirmed}
                            onValueChange={value => setFilterConfirmed(value)}
                        >
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder={t('query_state_item.title')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('query_state_item.all')}</SelectItem>
                                <SelectItem value="confirmed">{t('query_state_item.confirmed')}</SelectItem>
                                <SelectItem value="unconfirmed">{t('query_state_item.unconfirmed')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Input
                        className="w-60"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
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
            {showType === 'all' ? (
                <DataTable
                    columns={columns}
                    data={datasets}
                    pageCount={pageCount}
                    pagination={pagination}
                    setPagination={setPagination}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                />
            ) : (
                <>
                    {showType === 'sft' && <SftModeTable datasets={datasets} />}
                    {showType === 'dpo' && <DpoModeTable datasets={datasets} />}
                    {datasets.length === 0 && (
                        <div className="col-span-full flex flex-col items-center  border rounded-lg justify-center py-12">
                            <p className="text-sm text-muted-foreground">暂无数据</p>
                        </div>
                    )}
                    <PaginationC pagination={pagination} setPagination={setPagination} pageCount={pageCount} />
                </>
            )}
        </div>
    );
}
