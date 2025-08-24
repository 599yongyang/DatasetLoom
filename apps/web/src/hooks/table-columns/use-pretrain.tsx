import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useParams } from 'next/navigation';
import { ConfirmAlert } from '@/components/common/confirm-alert';
import React from 'react';
import { ProjectRole } from '@repo/shared-types';
import { WithPermission } from '@/components/common/permission-wrapper';
import { PretrainData } from '@/types/interfaces/pretrain';
import { useDelete } from '@/hooks/use-delete';

export function usePretrainTableColumns({ refresh }: { refresh: () => void; }) {
    const { projectId }: { projectId: string } = useParams();
    const { deleteItems } = useDelete();
    const handleDelete = async (id: string) => {
        await deleteItems(`/${projectId}/pretrain/delete`, [id], { onSuccess: refresh });
    };

    const columns: ColumnDef<PretrainData>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
            accessorKey: 'id',
            header: '标识',
            cell: ({ row }) => <div>{row.original.id}</div>
        },
        {
            id: 'content',
            header: '内容',
            cell: ({ row }) =>
                <div className="max-w-[60vw]">
                    <div
                        className="text-gray-700 text-sm leading-relaxed break-words whitespace-normal line-clamp-2"
                        title={row.original.content}
                    >
                        {row.original.content}
                    </div>
                </div>
        },
        {
            accessorKey: 'fileName',
            header: '所属文件',
            cell: ({ row }) => <div>{row.original.document.fileName}</div>
        },
        {
            id: 'actions',
            header: () => <div className="text-center">操作</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex flex-1 justify-center gap-1">
                        <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                            <ConfirmAlert
                                title={`确认要删除【${row.original.id}】此数据嘛？`}
                                message={'此操作不可逆，请谨慎操作！'}
                                onConfirm={() => handleDelete(row.original.id)}
                            >
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-red-500">
                                    <Trash2 />
                                </Button>
                            </ConfirmAlert>
                        </WithPermission>
                    </div>
                );
            }
        }
    ];
    return columns;
}

