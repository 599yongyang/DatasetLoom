import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Waypoints } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { useParams, useRouter } from 'next/navigation';
import { formatBytes } from '@/hooks/use-file-upload';
import { ConfirmAlert } from '@/components/confirm-alert';
import { type Documents } from '@prisma/client';
import { ChunkStrategyDialog } from '@/components/chunks/chunk-strategy-dialog';

export function useDocumentsTableColumns({ mutateDocuments }: { mutateDocuments: () => void }) {
    const router = useRouter();
    const { t } = useTranslation('document');
    const { projectId }: { projectId: string } = useParams();
    const deleteDocument = (fileId: string) => {
        toast.promise(
            axios.delete(`/api/project/${projectId}/documents`, {
                data: { documentIds: [fileId] }
            }),
            {
                loading: '数据删除中',
                success: _ => {
                    mutateDocuments();
                    return '删除成功';
                },
                error: error => {
                    return error.response?.data?.message || '删除失败';
                }
            }
        );
    };

    const columns: ColumnDef<Documents>[] = [
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
            accessorKey: 'fileName',
            header: t('table_columns.file_name'),
            cell: ({ row }) => <div className="text-foreground w-fit px-0 text-left">{row.original.fileName}</div>,
            enableHiding: false
        },
        {
            accessorKey: 'sourceType',
            header: t('table_columns.source_type'),
            cell: ({ row }) => <div>{formatSourceType(row.original.sourceType)}</div>
        },
        {
            accessorKey: 'fileExt',
            header: t('table_columns.file_ext'),
            cell: ({ row }) => <div>{row.original.fileExt}</div>
        },
        {
            accessorKey: 'size',
            header: t('table_columns.size'),
            cell: ({ row }) => (
                <Badge variant="outline" className="text-muted-foreground">
                    {formatBytes(row.original.size || row.original.parserFileSize || 0)}
                </Badge>
            )
        },
        {
            accessorKey: 'createdAt',
            header: t('table_columns.createdAt'),
            cell: ({ row }) => <div className="w-32">{new Date(row.original.createdAt).toLocaleString('zh-CN')}</div>
        },
        {
            id: 'actions',
            header: () => <div className="text-center">{t('table_columns.actions')}</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex flex-1 justify-center gap-2">
                        <ChunkStrategyDialog fileIds={[row.original.id]} fileExt={row.original.fileExt ?? ''} />
                        <Button
                            variant="ghost"
                            className={'hover:cursor-pointer'}
                            size="icon"
                            onClick={() => {
                                router.push(`/project/${projectId}/graph?kid=${row.original.id}`);
                            }}
                            aria-label="View"
                        >
                            <Waypoints size={30} />
                        </Button>
                        <ConfirmAlert
                            title={t('delete_title')}
                            message={row.original.fileName}
                            onConfirm={() => deleteDocument(row.original.id)}
                        />
                    </div>
                );
            }
        }
    ];

    return columns;
}

const formatSourceType = (type: string): string => {
    switch (type) {
        case 'local':
            return '本地文件';
        case 'webUrl':
            return '网站内容';
        case 'webFile':
            return '在线文件';
        default:
            return '未知';
    }
};
