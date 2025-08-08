import type {ColumnDef} from '@tanstack/react-table';
import {useTranslation} from 'react-i18next';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Waypoints} from 'lucide-react';
import {toast} from 'sonner';
import {Checkbox} from '@/components/ui/checkbox';
import {useParams, useRouter} from 'next/navigation';
import {formatBytes} from '@/hooks/use-file-upload';
import {ConfirmAlert} from '@/components/common/confirm-alert';
import {ChunkStrategyDialog} from '@/components/chunks/chunk-strategy-dialog';
import {ProjectRole} from '@repo/shared-types';
import {WithPermission} from '@/components/common/permission-wrapper';
import type {TFunction} from 'i18next';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import apiClient from "@/lib/axios";
import { DocumentsWithCount } from '@/types/interfaces';

export function useDocumentsTableColumns({mutateDocuments}: { mutateDocuments: () => void }) {
    const router = useRouter();
    const {t} = useTranslation('knowledge');
    const {projectId}: { projectId: string } = useParams();
    const deleteDocument = (fileId: string) => {
        toast.promise(apiClient.delete(`/${projectId}/document/delete?ids=${fileId}`),
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

    const columns: ColumnDef<DocumentsWithCount>[] = [
        {
            id: 'select',
            header: ({table}) => (
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
            cell: ({row}) => (
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
            cell: ({row}) => (
                <div className="text-foreground max-w-[30vw] px-0 text-left">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className={'truncate'}>{row.original.fileName}</p>
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                className="max-w-[50vw] p-2 bg-white shadow-lg rounded-md border border-gray-200"
                            >
                                {row.original.fileName}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ),
            enableHiding: false
        },
        {
            accessorKey: 'chunkCount',
            header: t('table_columns.chunk_count'),
            cell: ({row}) => <div className="text-foreground px-0 text-left">{row.original._count.Chunks}</div>,
            enableHiding: false
        },
        {
            accessorKey: 'sourceType',
            header: t('table_columns.source_type'),
            cell: ({row}) => (
                <div>
                    <Badge variant="outline" className="text-muted-foreground">
                        {formatSourceType(row.original.sourceType, t)}
                    </Badge>
                </div>
            )
        },
        {
            accessorKey: 'fileExt',
            header: t('table_columns.file_ext'),
            cell: ({row}) => <div>{row.original.fileExt}</div>
        },
        {
            accessorKey: 'size',
            header: t('table_columns.size'),
            cell: ({row}) => (
                <Badge variant="outline" className="text-muted-foreground">
                    {formatBytes(row.original.size || row.original.parserFileSize || 0)}
                </Badge>
            )
        },
        {
            accessorKey: 'createdAt',
            header: t('table_columns.createdAt'),
            cell: ({row}) => <div className="w-32">{new Date(row.original.createdAt).toLocaleString('zh-CN')}</div>
        },
        {
            id: 'actions',
            header: () => <div className="text-center">{t('table_columns.actions')}</div>,
            cell: ({row}) => {
                return (
                    <div className="flex flex-1 justify-center gap-2">
                        <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                            <ChunkStrategyDialog
                                fileIds={[row.original.id]}
                                fileExt={row.original.fileExt ?? ''}
                                refresh={mutateDocuments}
                            />
                        </WithPermission>
                        {row.original._count.Chunks > 0 && (
                            <Button
                                variant="ghost"
                                className={'hover:cursor-pointer'}
                                size="icon"
                                onClick={() => {
                                    router.push(`/project/${projectId}/graph?kid=${row.original.id}`);
                                }}
                                aria-label="View"
                            >
                                <Waypoints size={30}/>
                            </Button>
                        )}
                        <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                            <ConfirmAlert
                                title={t('delete_title')}
                                message={row.original.fileName}
                                onConfirm={() => deleteDocument(row.original.id)}
                            />
                        </WithPermission>
                    </div>
                );
            }
        }
    ];

    return columns;
}

const formatSourceType = (type: string, t: TFunction<'knowledge'>): string => {
    switch (type) {
        case 'local':
            return t('source_type.local');
        case 'webUrl':
            return t('source_type.web_url');
        case 'webFile':
            return t('source_type.web_file');
        default:
            return t('source_type.unknown');
    }
};
