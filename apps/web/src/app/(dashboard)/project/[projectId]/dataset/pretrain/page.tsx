'use client';

import { Button } from '@/components/ui/button';
import { FileUp, Trash2, Upload } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';
import { DocumentScope, ProjectRole } from '@repo/shared-types';
import { WithPermission } from '@/components/common/permission-wrapper';
import { usePagination } from '@/hooks/use-pagination';
import { useMemo, useState } from 'react';
import { usePretrainList } from '@/hooks/query/use-pretrain';
import { usePretrainTableColumns } from '@/hooks/table-columns/use-pretrain';
import { DataTable } from '@/components/data-table/data-table';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useDelete } from '@/hooks/use-delete';
import { downloadDataset } from '@/lib/utils';

export default function Page() {
    const router = useRouter();
    const { projectId } = useParams<{ projectId: string }>();
    const { deleteItems } = useDelete();
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);
    const { pagination, setPagination } = usePagination({
        defaultPageSize: 10,
        resetDeps: [debouncedQuery]
    });

    const { data, total, refresh } = usePretrainList({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        query: debouncedQuery
    });
    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const [rowSelection, setRowSelection] = useState({});
    const columns = usePretrainTableColumns({ refresh });


    const batchDelete = async () => {
        await deleteItems(`/${projectId}/pretrain/delete`,
            Object.keys(rowSelection), {
                onSuccess: () => {
                    setRowSelection({});
                    refresh();
                }
            }
        );
    };


    const exportDatasetsLocal = async () => {
        await downloadDataset({ url: `/${projectId}/pretrain/export` });
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="sticky top-0 z-10 bg-background/80 flex items-center justify-between gap-2">
                <div className={'flex gap-2'}>
                    <Input
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                        }}
                        placeholder={'搜索关键字'}
                    />
                    <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                        <Button
                            className={'hover:cursor-pointer'}
                            onClick={() => router.push(`/project/${projectId}/common/upload?scope=${DocumentScope.PRETRAIN}`)}>
                            <Upload size={30} />
                            创建数据集
                        </Button>
                    </WithPermission>
                </div>
                <div className={'flex items-center gap-2'}>
                    <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                        <Button
                            variant="outline"
                            disabled={Object.keys(rowSelection).length == 0}
                            onClick={batchDelete}
                            className={'text-red-500 hover:cursor-pointer hover:text-red-500'}
                        >
                            <Trash2 size={30} />
                            批量删除
                        </Button>
                        <Button
                            variant="outline"
                            className={'hover:cursor-pointer'}
                            onClick={exportDatasetsLocal}
                        >
                            <FileUp />
                            导出数据集
                        </Button>

                    </WithPermission>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={data}
                pageCount={pageCount}
                pagination={pagination}
                setPagination={setPagination}
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
            />
        </div>
    );
}
