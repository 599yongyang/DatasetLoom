import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, FileQuestion, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { useParams } from 'next/navigation';
import { ConfirmAlert } from '@/components/common/confirm-alert';
import type { ChunksVO } from '@/schema/chunks';
import { ChunkContentDialog } from '@/components/chunks/chunk-content-dialog';
import { ChunkInfoDialog } from '@/components/chunks/chunk-info-dialog';
import { QuestionStrategyDialog } from '@/components/questions/question-strategy-dialog';
import React, { useState } from 'react';
import { ProjectRole } from '@/schema/types';
import { WithPermission } from '../common/permission-wrapper';

export function useChunksTableColumns({ mutateChunks }: { mutateChunks: () => void }) {
    const { t } = useTranslation('chunk');
    const { projectId }: { projectId: string } = useParams();

    const handleDeleteChunk = async (chunkId: string) => {
        try {
            const response = await axios.delete(`/api/project/${projectId}/chunks/${chunkId}`);
            if (response.status === 200) {
                toast.success('删除成功');
                mutateChunks();
            }
        } catch (error) {
            toast.error('删除失败');
        }
    };

    const columns: ColumnDef<ChunksVO>[] = [
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
            header: t('table_columns.name'),
            cell: ({ row }) => (
                <div className="text-foreground w-fit px-0 text-left">
                    {row.original.name}
                    {row.original.Questions.length > 0 && (
                        <Badge variant="secondary" className="flex gap-1 px-1.5 bg-green-300  [&_svg]:size-3">
                            {row.original.Questions.length} 个问题
                        </Badge>
                    )}
                </div>
            ),
            enableHiding: false
        },
        {
            accessorKey: 'content',
            header: t('table_columns.content'),
            cell: ({ row }) => (
                <div className="text-foreground w-100 truncate px-0 text-left">{row.original.content}</div>
            ),
            enableHiding: false
        },
        {
            accessorKey: 'domain',
            header: t('table_columns.domain'),
            cell: ({ row }) => (
                <Badge variant="outline" className="text-muted-foreground">
                    {row.original.ChunkMetadata?.domain} / {row.original.ChunkMetadata?.subDomain}
                </Badge>
            )
        },
        {
            accessorKey: 'tag',
            header: t('table_columns.tag'),
            cell: ({ row }) => (
                <div className={'flex flex-wrap gap-2'}>
                    {row.original.ChunkMetadata?.tags
                        ?.split(',')
                        ?.filter((tag: string) => tag.trim()) // 过滤掉空字符串
                        ?.map((tag: string) => (
                            <Badge key={tag.trim()} variant="outline" className="text-muted-foreground ">
                                {tag.trim()}
                            </Badge>
                        ))}
                </div>
            )
        },
        {
            accessorKey: 'fileName',
            header: t('table_columns.fileName'),
            cell: ({ row }) => <div>{row.original.fileName}</div>
        },
        {
            accessorKey: 'size',
            header: t('table_columns.size'),
            cell: ({ row }) => <div>{row.original.size}</div>
        },
        {
            id: 'actions',
            header: () => <div className="text-center">{t('table_columns.actions')}</div>,
            cell: ({ row }) => {
                const [open, setOpen] = useState(false);
                return (
                    <div className="flex flex-1 justify-center gap-2">
                        <ChunkContentDialog title={row.original.name} chunkContent={row.original.content}>
                            <Button variant="ghost" size="icon">
                                <Eye />
                            </Button>
                        </ChunkContentDialog>
                        <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                            <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
                                <FileQuestion />
                            </Button>

                            {open && (
                                <QuestionStrategyDialog
                                    type={'single'}
                                    open={open}
                                    setOpen={setOpen}
                                    chunks={[{ id: row.original.id, name: row.original.name }]}
                                    mutateChunks={mutateChunks}
                                />
                            )}

                            <ChunkInfoDialog item={row.original} refresh={mutateChunks} />
                        </WithPermission>
                        <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                            <ConfirmAlert
                                title={`确认要删除【${row.original.name}】此文本块嘛？`}
                                message={'此操作不可逆，请谨慎操作！'}
                                onConfirm={() => handleDeleteChunk(row.original.id)}
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
