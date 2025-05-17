'use client';

import { useMemo, useState } from 'react';
import { useWorkflows } from '@/hooks/query/use-workflow';
import { useParams, useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { type WorkFlow } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, FilterIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table/data-table';
import { nanoid } from 'nanoid';
import { workflowStatusOptions } from '@/lib/data-dictionary';
import SaveDialog from '@/components/workflow/save-dialog';

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

    const columns: ColumnDef<WorkFlow>[] = [
        {
            accessorKey: 'name',
            header: () => <div className="text-foreground  pl-2 w-32 px-0 text-left">名称</div>,
            cell: ({ row }) => <div className="text-foreground pl-2 w-32 px-0 text-left">{row.original.name}</div>,
            enableHiding: false,
            size: 200
        },
        {
            accessorKey: 'description',
            header: () => <div className="text-foreground  pl-2 w-32 px-0 text-left">描述</div>,
            cell: ({ row }) => (
                <div className="text-foreground pl-2 w-32 px-0 text-left">{row.original.description}</div>
            ),
            enableHiding: false,
            size: 200
        },
        {
            accessorKey: 'status',
            header: '状态',
            cell: ({ row }) => {
                const statusOption = workflowStatusOptions.find(option => option.value === row.original.status);

                if (!statusOption) return <div>未知状态</div>;

                const { icon: Icon, label } = statusOption;

                return (
                    <Badge variant="outline" className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3">
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                    </Badge>
                );
            },
            enableHiding: false
        },
        {
            accessorKey: 'createAt',
            header: '编辑时间',
            cell: ({ row }) => <div className="w-32">{new Date(row.original.updateAt).toLocaleString('zh-CN')}</div>,
            enableHiding: false
        },
        {
            id: 'actions',
            header: () => <div>操作</div>,
            cell: ({ row }) => (
                <div className={'flex flex-1'}>
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
            <SaveDialog open={open} setOpen={setOpen} formData={workflowData} setFormData={setWorkflowData} />
        </div>
    );
}
