'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { WithPermission } from '@/components/common/permission-wrapper';
import { ProjectRole } from '@repo/shared-types';
import { DataTable } from '@/components/data-table/data-table';
import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePromptTemplate } from '@/hooks/query/use-prompt-template';
import { usePromptTemplateTableColumns } from '@/hooks/table-columns/use-prompt-template';
import { AddPromptDialog } from '@/components/prompt-template/add-prompt-dialog';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';

export default function Page() {
    const { projectId }: { projectId: string } = useParams();
    const [name, setName] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });
    const {
        data,
        total,
        refresh: refresh
    } = usePromptTemplate({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        name
    });
    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const [rowSelection, setRowSelection] = useState({});
    const columns = usePromptTemplateTableColumns({ refresh: refresh });
    const [open, setOpen] = useState(false);


    const batchDelete = async () => {
        toast.promise(
            apiClient.delete(`/${projectId}/prompt-template/delete`, {
                params: { ids: Object.keys(rowSelection).join(',') }
            }),
            {
                loading: `正在删除 ${Object.keys(rowSelection).length} 个提示词...`,
                success: _ => {
                    refresh();
                    return `成功删除 ${Object.keys(rowSelection).length} 个提示词`;
                },
                error: error => {
                    return error.message || '批量删除提示词失败';
                }
            }
        );
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="sticky top-0 z-10 bg-background/80 s flex items-center justify-between gap-2">
                <div className={'flex gap-2 w-1/2'}>
                    <Input
                        className="w-1/3"
                        value={name}
                        placeholder="搜索提示词名称..."
                        onChange={e => {
                            setName(e.target.value);
                            setPagination({ ...pagination, pageIndex: 0 });
                        }}
                    />
                </div>
                <div className={'flex items-center gap-2'}>
                    <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                        <Button className={'hover:cursor-pointer'} onClick={() => setOpen(true)}>
                            <PlusCircle size={30} /> 新建Prompt
                        </Button>
                    </WithPermission>
                    <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                        <Button
                            variant="outline"
                            onClick={batchDelete}
                            disabled={Object.keys(rowSelection).length == 0}
                            className={'text-red-500 hover:cursor-pointer hover:text-red-500'}
                        >
                            <Trash2 size={30} />
                            <span className="hidden lg:inline ">批量删除</span>
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
            <AddPromptDialog open={open} setOpen={setOpen} />
        </div>
    );
}
