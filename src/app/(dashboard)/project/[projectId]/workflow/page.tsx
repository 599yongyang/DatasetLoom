'use client';

import { useMemo, useState } from 'react';
import { useWorkflows } from '@/hooks/query/use-workflow';
import { useParams, useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { type WorkFlow } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, FileClock, FilterIcon, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table/data-table';
import { nanoid } from 'nanoid';
import { workflowStatusOptions } from '@/lib/data-dictionary';
import SaveDialog from '@/components/workflow/save-dialog';
import StepLog from '@/components/workflow/step-log';
import { ConfirmAlert } from '@/components/common/confirm-alert';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';

export default function Page() {
    const { projectId } = useParams<{ projectId: string }>();
    const router = useRouter();
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });
    const { workflows, total, refresh } = useWorkflows({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize
    });

    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);

    const [open, setOpen] = useState(false);
    const [workflowData, setWorkflowData] = useState({} as WorkFlow);
    const [workflowId, setWorkflowId] = useState('');
    const [openLog, setOpenLog] = useState(false);

    const deleteWorkflow = async (id: string) => {
        toast.promise(axios.delete(`/api/project/${projectId}/workflow/${id}`), {
            loading: '删除中...',
            success: () => {
                refresh();
                return '删除成功';
            },
            error: e => e.response?.data?.message || '删除失败'
        });
    };

    const columns: ColumnDef<WorkFlow>[] = [
        {
            accessorKey: 'name',
            header: () => <div className={'w-50'}>名称</div>,
            cell: ({ row }) => <div className={'w-fit'}>{row.original.name}</div>
        },
        {
            accessorKey: 'description',
            header: () => <div className="text-foreground  pl-2 w-50 px-0 text-left">描述</div>,
            cell: ({ row }) => <div className="text-foreground pl-2 w-2 px-0 text-left">{row.original.description}</div>
        },
        {
            accessorKey: 'status',
            header: () => <div className="text-center w-20">状态</div>,
            cell: ({ row }) => {
                const statusOption = workflowStatusOptions.find(option => option.value === row.original.status);

                if (!statusOption) return <div>未知状态</div>;

                const { icon: Icon, label, iconClassName } = statusOption;

                return (
                    <Badge variant="outline" className="flex gap-1 px-1.5 w-20 text-muted-foreground [&_svg]:size-3">
                        <Icon className={iconClassName} />
                        <span>{label}</span>
                    </Badge>
                );
            },
            enableHiding: false
        },
        {
            accessorKey: 'runAt',
            header: '运行时间',
            cell: ({ row }) => (
                <div className="w-20">{row.original.runAt ? format(row.original.runAt, 'yyyy-MM-dd HH:mm') : '无'}</div>
            ),
            enableHiding: false
        },
        {
            accessorKey: 'createdAt',
            header: '编辑时间',
            cell: ({ row }) => <div className="w-20">{new Date(row.original.updatedAt).toLocaleString('zh-CN')}</div>,
            enableHiding: false
        },
        {
            id: 'actions',
            header: () => <div className="text-center w-20">操作</div>,
            cell: ({ row }) => (
                <div className={'flex flex-1 w-32'}>
                    <Button
                        variant="ghost"
                        className={'hover:cursor-pointer'}
                        size="icon"
                        onClick={() => {
                            setWorkflowId(row.original.id);
                            setOpenLog(true);
                        }}
                    >
                        <FileClock size={30} />
                    </Button>
                    <Button
                        variant="ghost"
                        className={'hover:cursor-pointer'}
                        size="icon"
                        onClick={() => router.push(`/project/${projectId}/workflow/${row.original.id}`)}
                        aria-label="查看工作流"
                    >
                        <Eye size={30} />
                    </Button>
                    <Button
                        variant="ghost"
                        className={'hover:cursor-pointer'}
                        size="icon"
                        onClick={() => {
                            setWorkflowData(row.original);
                            setOpen(true);
                        }}
                    >
                        <Edit size={30} />
                    </Button>
                    <ConfirmAlert
                        title={'确认要删除此工作流吗？'}
                        message={row.original.name}
                        onConfirm={() => deleteWorkflow(row.original.id)}
                    />
                </div>
            ),
            enableHiding: false,
            size: 50
        }
    ];

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="sticky top-0 z-10 bg-background/80 flex items-center justify-between gap-2">
                <div className={'flex gap-2 w-1/2'}>
                    <Input className="w-1/3" />
                </div>
                <div className={'flex items-center gap-2'}>
                    <Button
                        className={'hover:cursor-pointer'}
                        onClick={() => router.push(`/project/${projectId}/workflow/${nanoid()}`)}
                    >
                        <Plus size={30} />
                        <span className="hidden lg:inline ">创建工作流</span>
                    </Button>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={workflows}
                pageCount={pageCount}
                pagination={pagination}
                setPagination={setPagination}
            />
            <SaveDialog open={open} setOpen={setOpen} formData={workflowData} refresh={refresh} />
            <StepLog openLog={openLog} setOpenLog={setOpenLog} workflowId={workflowId} projectId={projectId} />
        </div>
    );
}
