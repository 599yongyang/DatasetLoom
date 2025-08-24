import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useParams, useRouter } from 'next/navigation';
import { ConfirmAlert } from '@/components/common/confirm-alert';
import { ProjectRole } from '@repo/shared-types';
import { WithPermission } from '@/components/common/permission-wrapper';
import { PromptTemplate } from '@/types/interfaces/prompt';
import { promptTemplateTypeOptions } from '@/constants/data-dictionary';
import { useDelete } from '@/hooks/use-delete';

export function usePromptTemplateTableColumns({ refresh }: { refresh: () => void }) {
    const router = useRouter();
    const { projectId }: { projectId: string } = useParams();
    const { deleteItems } = useDelete();
    const handleDelete = async (id: string) => {
        await deleteItems(`/${projectId}/prompt-template/delete`, [id], { onSuccess: refresh });
    };

    const columns: ColumnDef<PromptTemplate>[] = [
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
            accessorKey: 'name',
            header: '名称',
            cell: ({ row }) => (
                <div className="text-foreground px-0 text-left">
                    {row.original.name}
                </div>
            ),
            enableHiding: false
        },
        {
            accessorKey: 'description',
            header: '描述',
            cell: ({ row }) => (
                <div className="text-foreground w-[200] px-0 text-left">
                    {row.original.description}
                </div>
            ),
            enableHiding: false,
            maxSize: 300
        },
        {
            accessorKey: 'content',
            header: '内容',
            cell: ({ row }) => (
                <div className={'text-left'}>
                    <div className={'truncate max-w-xl'}>{row.original.content}</div>
                </div>
            )
        },
        {
            accessorKey: 'type',
            header: '类型',
            cell: ({ row }) => <div
                className="text-foreground px-0 text-left">{promptTemplateTypeOptions.find(item => item.value === row.original.type)?.label}</div>,
            enableHiding: false
        },
        {
            accessorKey: 'updatedAt',
            header: '更新时间',
            cell: ({ row }) => <div>{new Date(row.original.updatedAt).toLocaleString('zh-CN')}</div>
        },
        {
            id: 'actions',
            header: () => <div className="text-center">操作</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex flex-1 justify-center gap-2">
                        <Button variant="ghost" size="sm"
                                onClick={() => router.push(`/project/${projectId}/settings/prompt-template/${row.original.id}`)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                            <ConfirmAlert
                                title={'删除'}
                                message={row.original.name}
                                onConfirm={() => handleDelete(row.original.id)}
                            />
                        </WithPermission>
                    </div>
                );
            },
            maxSize: 100
        }
    ];
    return columns;
}
