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
import type { ChunksVO } from '@/schema/chunks';
import { useChunksTableColumns } from '@/components/chunks/table-columns';
import { DraggableMergeDataTable } from '@/components/data-table/draggable-merge-data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuestionStrategyDialog } from '@/components/questions/question-strategy-dialog';
import type { SelectedChunk } from '@/hooks/use-generate-question';
import { ProjectRole } from '@/schema/types';
import { WithPermission } from '@/components/common/permission-wrapper';

export default function Page() {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('chunk');

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

    const [selectedChunks, setSelectedChunks] = useState<SelectedChunk[]>([]);
    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const [rowSelection, setRowSelection] = useState({});
    const [open, setOpen] = useState(false);
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
                        placeholder={t('search')}
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="状态" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('select_item.all')}</SelectItem>
                                <SelectItem value="generated">{t('select_item.generated')}</SelectItem>
                                <SelectItem value="ungenerated">{t('select_item.unGenerated')}</SelectItem>
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
                            <span className="hidden lg:inline ">{t('batch_delete_btn')}</span>
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
                            <span className="hidden lg:inline ">{t('gen_btn')}</span>
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
            {open && (
                <QuestionStrategyDialog
                    type={'multiple'}
                    open={open}
                    setOpen={setOpen}
                    chunks={selectedChunks}
                    mutateChunks={refresh}
                />
            )}
        </div>
    );
}
