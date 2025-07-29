'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileQuestion, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { useChunks } from '@/hooks/query/use-chunks';
import axios from 'axios';
import { toast } from 'sonner';
import type { ChunksVO } from '@/server/db/schema/chunks';
import { DraggableMergeDataTable } from '@/components/data-table/draggable-merge-data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuestionStrategyDialog } from '@/components/questions/question-strategy-dialog';
import { ProjectRole } from '@/server/db/types';
import { WithPermission } from '@/components/common/permission-wrapper';
import { useTextChunkTableColumns } from '@/hooks/table-columns/use-text-chunk';
import type { SelectedChunk } from '@/hooks/use-generate-question';

export default function Page() {
    const { projectId }: { projectId: string } = useParams();
    const { t: tCommon } = useTranslation('common');
    const { t: tChunk } = useTranslation('chunk');

    const [fileName, setFileName] = useState('');
    const [status, setStatus] = useState('all');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });
    const { chunks, total, refresh } = useChunks({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        fileIds: [],
        status: status
    });

    useEffect(() => {
        setPagination({ ...pagination, pageIndex: 0 });
    }, [status, fileName]);

    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const [rowSelection, setRowSelection] = useState({});
    const [open, setOpen] = useState(false);
    const [selectedChunks, setSelectedChunks] = useState<SelectedChunk[]>([]);
    const handleOpenDialog = (chunk: ChunksVO) => {
        setSelectedChunks([{ id: chunk.id, name: chunk.name }]);
        setOpen(true);
    };
    const columns = useTextChunkTableColumns({ mutateChunks: refresh, onOpenDialog: handleOpenDialog });

    const handleMergeChunks = async (activeRow: ChunksVO, overRow: ChunksVO) => {
        const res = await axios.post(`/api/project/${projectId}/chunks/merge`, {
            sourceId: activeRow.id,
            targetId: overRow.id
        });
        if (res.status === 200) {
            void refresh();
            toast.success(tCommon('messages.operate_success'));
        } else {
            toast.error(tCommon('messages.operate_fail'));
        }
    };
    useEffect(() => {
        if (Object.keys(rowSelection).length > 0) {
            setSelectedChunks(
                Object.keys(rowSelection).map(id => {
                    const chunk = chunks.find(chunk => chunk.id === id);
                    return {
                        id: chunk?.id || '',
                        name: chunk?.name || ''
                    };
                })
            );
        }
    }, [rowSelection]);
    const batchDeleteChunks = async () => {
        toast.promise(
            axios.delete(`/api/project/${projectId}/chunks`, {
                data: { chunkIds: Object.keys(rowSelection) }
            }),
            {
                loading: tCommon('messages.delete_loading', { count: Object.keys(rowSelection).length }),
                success: _ => {
                    setRowSelection({});
                    refresh();
                    return tCommon('messages.delete_success', { count: Object.keys(rowSelection).length });
                },
                error: error => {
                    return error.response?.data?.message || tCommon('messages.delete_fail');
                }
            }
        );
    };

    const handelGenerateQuestions = async () => {
        setOpen(true);
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="bg-background/80 s flex items-center justify-between gap-2">
                <div className={'flex gap-2 w-1/2'}>
                    <Input
                        className="w-1/3"
                        value={fileName}
                        onChange={e => {
                            setFileName(e.target.value);
                            setPagination({ ...pagination, pageIndex: 0 });
                        }}
                        placeholder={tChunk('search')}
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="状态" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{tChunk('select_item.all')}</SelectItem>
                                <SelectItem value="generated">{tChunk('select_item.generated')}</SelectItem>
                                <SelectItem value="ungenerated">{tChunk('select_item.unGenerated')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className={'flex items-center gap-2'}>
                    <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                        <Button
                            variant="outline"
                            disabled={Object.keys(rowSelection).length == 0}
                            onClick={batchDeleteChunks}
                            className={'text-red-500 hover:cursor-pointer hover:text-red-500'}
                        >
                            <Trash2 size={30} />
                            <span className="hidden lg:inline ">{tChunk('batch_delete_btn')}</span>
                        </Button>
                    </WithPermission>
                    <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                        <Button
                            variant="outline"
                            className={'hover:cursor-pointer'}
                            disabled={Object.keys(rowSelection).length == 0}
                            onClick={handelGenerateQuestions}
                        >
                            <FileQuestion size={30} />
                            <span className="hidden lg:inline ">{tChunk('gen_btn')}</span>
                        </Button>
                    </WithPermission>
                </div>
            </div>
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
            {selectedChunks.length > 0 && (
                <QuestionStrategyDialog open={open} setOpen={setOpen} chunks={selectedChunks} mutateChunks={refresh} />
            )}
        </div>
    );
}
