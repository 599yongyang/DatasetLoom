import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon, Edit, Eye, FileQuestion, SquareSplitVertical, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { useParams } from 'next/navigation';
import { useGenerateDataset } from '@/hooks/use-generate-dataset';
import { formatBytes } from '@/hooks/use-file-upload';
import { ConfirmAlert } from '@/components/confirm-alert';
import { type Documents } from '@prisma/client';
import { ChunkStrategyDialog } from '@/components/chunks/chunk-strategy-dialog';
import { useGenerateQuestion } from '@/hooks/use-generate-question';
import type { ChunksVO } from '@/schema/chunks';
import { ChunkContentDialog } from '@/components/chunks/chunk-content-dialog';
import { ChunkInfoDialog } from '@/components/chunks/chunk-info-dialog';

export function useChunksTableColumns({ mutateChunks }: { mutateChunks: () => void }) {
    const { t } = useTranslation('document');
    const { projectId }: { projectId: string } = useParams();
    const { generateSingleQuestion } = useGenerateQuestion();

    const handleGenerateQuestion = async (chunkId: string, chunkName: string) => {
        await generateSingleQuestion({ projectId, chunkId, chunkName });
        mutateChunks();
    };
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
            accessorKey: 'fileName',
            header: '文本块名称',
            cell: ({ row }) => <div className="text-foreground w-fit px-0 text-left">{row.original.name}</div>,
            enableHiding: false
        },
        {
            accessorKey: 'content',
            header: '文本块内容',
            cell: ({ row }) => (
                <div className="text-foreground w-100 truncate px-0 text-left">{row.original.content}</div>
            ),
            enableHiding: false
        },
        {
            accessorKey: 'domain',
            header: '所属领域',
            cell: ({ row }) => (
                <Badge variant="outline" className="text-muted-foreground">
                    {row.original.ChunkMetadata?.domain} / {row.original.ChunkMetadata?.subDomain}
                </Badge>
            )
        },
        {
            accessorKey: 'tag',
            header: '标签',
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
            accessorKey: 'fileExt',
            header: '所属文件',
            cell: ({ row }) => <div>{row.original.fileName}</div>
        },
        {
            accessorKey: 'size',
            header: '字符长度',
            cell: ({ row }) => <div>{row.original.size}</div>
        },
        // {
        //     accessorKey: 'createAt',
        //     header: "分块时间",
        //     cell: ({row}) => <div className="w-32">{new Date(row.original.createAt).toLocaleString('zh-CN')}</div>
        // },
        {
            id: 'actions',
            header: () => <div className="text-center">{t('table_columns.actions')}</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex flex-1 justify-center gap-2">
                        <ChunkContentDialog title={row.original.name} chunkContent={row.original.content}>
                            <Button variant="ghost" size="icon">
                                <Eye />
                            </Button>
                        </ChunkContentDialog>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGenerateQuestion(row.original.id, row.original.name)}
                        >
                            <FileQuestion />
                        </Button>
                        <ChunkInfoDialog item={row.original} refresh={mutateChunks} />

                        <ConfirmAlert
                            title={`确认要删除【${row.original.name}】此文本块嘛？`}
                            message={'此操作不可逆，请谨慎操作！'}
                            onConfirm={() => handleDeleteChunk(row.original.id)}
                        >
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-red-500">
                                <Trash2 />
                            </Button>
                        </ConfirmAlert>
                    </div>
                );
            }
        }
    ];

    return columns;
}
