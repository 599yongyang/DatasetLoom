'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileQuestion, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { useChunkList } from '@/hooks/query/use-chunks';
import { toast } from 'sonner';
import { DraggableMergeDataTable } from '@/components/data-table/draggable-merge-data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectRole, PromptTemplateType } from '@repo/shared-types';
import { WithPermission } from '@/components/common/permission-wrapper';
import { useTextChunkTableColumns } from '@/hooks/table-columns/use-text-chunk';
import { useGenerateQuestion } from '@/hooks/generate/use-generate-question';
import { Chunks } from '@/types/interfaces';
import apiClient from '@/lib/axios';
import { GenerateStrategyDialog } from '@/components/common/generate-strategy-dialog';
import { usePagination } from '@/hooks/use-pagination';
import { GenerateItem, StrategyParamsType } from '@/types/generate';
import { useDelete } from '@/hooks/use-delete';

export default function Page() {
    const { projectId }: { projectId: string } = useParams();
    const { t: tCommon } = useTranslation('common');
    const { t: tChunk } = useTranslation('chunk');
    const { generateSingleQuestion, generateMultipleQuestion } = useGenerateQuestion();
    const { deleteItems } = useDelete();
    const [fileName, setFileName] = useState('');
    const [status, setStatus] = useState('all');
    const { pagination, setPagination } = usePagination({
        defaultPageSize: 10,
        resetDeps: [status, fileName]
    });
    const { chunks, total, refresh } = useChunkList({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        fileIds: [],
        status: status,
        query: fileName
    });

    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const [rowSelection, setRowSelection] = useState({});
    const [open, setOpen] = useState(false);
    const [selectedChunks, setSelectedChunks] = useState<GenerateItem[]>([]);
    const handleOpenDialog = (chunk: Chunks) => {
        setSelectedChunks([{ id: chunk.id, name: chunk.name }]);
        setOpen(true);
    };
    const columns = useTextChunkTableColumns({ refresh, onOpenDialog: handleOpenDialog });

    const handleMergeChunks = async (activeRow: Chunks, overRow: Chunks) => {
        const res = await apiClient.post(`/${projectId}/documentChunk/merge`, {
            sourceId: activeRow.id,
            targetId: overRow.id
        });
        if (res.data) {
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


    const batchDelete = async () => {
        await deleteItems(`/${projectId}/documentChunk/delete`,
            Object.keys(rowSelection), {
                onSuccess: () => {
                    setRowSelection({});
                    refresh();
                }
            }
        );
    };


    const handleGenerate = async (strategyParams: StrategyParamsType) => {
        if (selectedChunks.length === 1 && selectedChunks[0]) {
            await generateSingleQuestion({
                projectId, item: selectedChunks[0], questionStrategy: strategyParams
            });
        } else {
            await generateMultipleQuestion(projectId, selectedChunks, strategyParams);
        }
        setOpen(false);
        void refresh();
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
                    <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                        <Button
                            variant="outline"
                            className={'hover:cursor-pointer'}
                            disabled={Object.keys(rowSelection).length == 0}
                            onClick={() => {
                                setOpen(true);
                            }}
                        >
                            <FileQuestion size={30} />
                            <span className="hidden lg:inline ">{tChunk('gen_btn')}</span>
                        </Button>
                    </WithPermission>
                    <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                        <Button
                            variant="outline"
                            disabled={Object.keys(rowSelection).length == 0}
                            onClick={batchDelete}
                            className={'text-red-500 hover:cursor-pointer hover:text-red-500'}
                        >
                            <Trash2 size={30} />
                            <span className="hidden lg:inline ">{tChunk('batch_delete_btn')}</span>
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
                <GenerateStrategyDialog open={open} setOpen={setOpen} promptTemplateType={PromptTemplateType.QUESTION}
                                        handleGenerate={handleGenerate} />
            )}
        </div>
    );
}
