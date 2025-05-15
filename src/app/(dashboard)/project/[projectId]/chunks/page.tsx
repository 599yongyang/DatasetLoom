'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Eye, FileQuestion, SquareSplitVertical, Trash2, Wand } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table/data-table';
import { useDocumentsTableColumns } from '@/components/documents/table-columns';
import { useDocuments } from '@/hooks/query/use-documents';
import { UploadFile } from '@/components/documents/upload-file';
import { ChunkList } from '@/components/chunks/chunk-list';
import { useChunks } from '@/hooks/query/use-chunks';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ChunkDialog } from '@/components/chunks/chunk-dialog';
import { ConfirmAlert } from '@/components/confirm-alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useGenerateQuestion } from '@/hooks/use-generate-question';
import axios from 'axios';
import { toast } from 'sonner';
import type { ChunksVO } from '@/schema/chunks';
import { useChunksTableColumns } from '@/components/chunks/table-columns';
import { DraggableMergeDataTable } from '@/components/data-table/draggable-merge-data-table';

type SelectedChunk = {
    id: string;
    name: string;
};
export default function Page() {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('document');

    const [fileName, setFileName] = useState('');
    const [fileExt, setFileExt] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });
    const { chunks, total, isLoading, refresh } = useChunks({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        fileIds: [],
        status: ''
    });
    const [selectedChunks, setSelectedChunks] = useState<SelectedChunk[]>([]);
    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const [rowSelection, setRowSelection] = useState({});
    const columns = useChunksTableColumns({ mutateChunks: refresh });

    const handleMergeChunks = async (activeRow: ChunksVO, overRow: ChunksVO) => {
        const res = await axios.post(`/api/project/${projectId}/chunks/merge`, {
            sourceId: activeRow.id,
            targetId: overRow.id
        });
        if (res.status === 200) {
            void refresh();
            toast.success('合并成功');
        } else {
            toast.error('合并失败');
        }
    };

    const batchDeleteChunks = async () => {
        toast.promise(
            axios.delete(`/api/project/${projectId}/chunks`, {
                data: { chunkIds: Object.keys(rowSelection) }
            }),
            {
                loading: `正在删除 ${Object.keys(rowSelection).length} 个文本块...`,
                success: _ => {
                    refresh();
                    return `成功删除 ${Object.keys(rowSelection).length} 个文本块`;
                },
                error: error => {
                    return error.response?.data?.message || '批量删除问题失败';
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
                        value={fileName}
                        onChange={e => {
                            setFileName(e.target.value);
                            setPagination({ ...pagination, pageIndex: 0 });
                        }}
                        placeholder={t('search')}
                    />
                </div>
                <div className={'flex items-center gap-2'}>
                    <Button
                        variant="outline"
                        disabled={Object.keys(rowSelection).length == 0}
                        onClick={batchDeleteChunks}
                        className={'text-red-500 hover:cursor-pointer hover:text-red-500'}
                    >
                        <Trash2 size={30} />
                        <span className="hidden lg:inline ">删除所选文本块</span>
                    </Button>

                    <Button
                        variant="outline"
                        className={'hover:cursor-pointer'}
                        disabled={Object.keys(rowSelection).length == 0}
                    >
                        <FileQuestion size={30} />
                        <span className="hidden lg:inline ">为所选文本块生成问题</span>
                    </Button>
                </div>
            </div>
            {/*<ChunkList chunks={chunks} getChunks={refresh} projectId={projectId}/>*/}
            <DraggableMergeDataTable
                columns={columns}
                data={chunks}
                pageCount={pageCount}
                pagination={pagination}
                setPagination={setPagination}
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                onMerge={handleMergeChunks}
            />
        </div>
    );
}
