'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SquareSplitVertical, Trash2, Upload } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table/data-table';
import { useDocumentList } from '@/hooks/query/use-documents';
import { ChunkStrategyDialog } from '@/components/chunks/chunk-strategy-dialog';
import { toast } from 'sonner';
import { DocumentScope, ProjectRole, PromptTemplateType } from '@repo/shared-types';
import { WithPermission } from '@/components/common/permission-wrapper';
import { useDocumentsTableColumns } from '@/hooks/table-columns/use-document';
import apiClient from '@/lib/axios';
import { fileTypeOption } from '@/constants/data-dictionary';
import { GenerateStrategyDialog } from '@/components/common/generate-strategy-dialog';
import { StrategyParamsType } from '@/types/generate';
import { usePagination } from '@/hooks/use-pagination';
import { useDelete } from '@/hooks/use-delete';

export default function Page() {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('knowledge');
    const router = useRouter();
    const { deleteItems } = useDelete();
    const [fileName, setFileName] = useState('');
    const [fileExt, setFileExt] = useState('');
    const { pagination, setPagination } = usePagination({
        defaultPageSize: 10,
        resetDeps: [fileName, fileExt]
    });
    const { data, total, refresh } = useDocumentList({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        fileName,
        fileExt: fileExt === 'all' ? '' : fileExt
    });
    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const [rowSelection, setRowSelection] = useState({});
    const [graphPrompt, setGraphPrompt] = useState(false);
    const [currentId, setCurrentId] = useState('');
    const handelGraph = (id: string) => {
        apiClient.get(`/${projectId}/document/check-graph?id=${id}`)
            .then(res => {
                if (res.data.data) {
                    router.push(`/project/${projectId}/graph?kid=${id}`);
                    return;
                } else {
                    setGraphPrompt(true);
                    setCurrentId(id);
                }
            })
            .catch(err => {
                console.log(err);
            });
    };


    const columns = useDocumentsTableColumns({ refresh, handelGraph });
    const [fileIds, setFileIds] = useState<string[]>([]);
    const [open, setOpen] = useState(false);

    const batchDelete = async () => {
        await deleteItems(`/${projectId}/document/delete`,
            Object.keys(rowSelection), {
                onSuccess: () => {
                    setRowSelection({});
                    refresh();
                }
            }
        );
    };

    const handelGenGraph = async (strategyParams: StrategyParamsType) => {
        setGraphPrompt(false);
        const toastId = toast.loading('数据生成中', { position: 'top-right' });
        try {
            await apiClient.post(`/${projectId}/document/gen-tag-rel`, {
                itemId: currentId,
                ...strategyParams
            });

            toast.success('生成成功', {
                id: toastId,
                action: {
                    label: '查看',
                    onClick: () => {
                        router.push(`/project/${projectId}/graph?kid=${currentId}`);
                    }
                }
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || '生成失败', { id: toastId });
        }
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="sticky top-0 z-10 bg-background/80 s flex items-center justify-between gap-2">
                <div className={'flex gap-2 w-1/2'}>
                    <Input
                        className="w-1/3"
                        value={fileName}
                        onChange={e => setFileName(e.target.value)}
                        placeholder={t('search')}
                    />
                    <Select
                        value={fileExt}
                        onValueChange={value => setFileExt(value)}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder={t('file_ext')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('file_ext_all')}</SelectItem>
                            {fileTypeOption.map(item => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                        <Button
                            onClick={() => router.push(`/project/${projectId}/common/upload?scope=${DocumentScope.QA}`)}>
                            <Upload size={30} />
                            {t('upload_btn')}
                        </Button>
                    </WithPermission>
                    {/*<Button*/}
                    {/*    variant="outline"*/}
                    {/*    className={'hover:cursor-pointer'}*/}
                    {/*    onClick={() => router.push(`/project/${projectId}/graph`)}*/}
                    {/*>*/}
                    {/*    <Waypoints size={30} />*/}
                    {/*    <span className="hidden lg:inline ">{t('graph_btn')}</span>*/}
                    {/*</Button>*/}
                </div>
                <div className={'flex items-center gap-2'}>
                    <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                        <ChunkStrategyDialog
                            fileIds={fileIds}
                            fileExt={''}
                            open={open}
                            onOpenChange={setOpen}
                            refresh={refresh}
                        >
                            <Button
                                variant="outline"
                                disabled={Object.keys(rowSelection).length == 0}
                                className={'hover:cursor-pointer'}
                                onClick={() => {
                                    setFileIds(Object.keys(rowSelection));
                                    setOpen(true);
                                }}
                            >
                                <SquareSplitVertical size={30} />
                                <span className="hidden lg:inline ">{t('chunk_btn')}</span>
                            </Button>
                        </ChunkStrategyDialog>
                    </WithPermission>
                    <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                        <Button
                            variant="outline"
                            disabled={Object.keys(rowSelection).length == 0}
                            onClick={batchDelete}
                            className={'text-red-500 hover:cursor-pointer hover:text-red-500'}
                        >
                            <Trash2 size={30} />
                            <span className="hidden lg:inline ">{t('delete_btn')}</span>
                        </Button>
                    </WithPermission>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={data}
                pageCount={pageCount}
                pagination={pagination}
                setPagination={setPagination}
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
            />

            {currentId && (<GenerateStrategyDialog open={graphPrompt} setOpen={setGraphPrompt}
                                                   promptTemplateType={PromptTemplateType.LABEL}
                                                   handleGenerate={handelGenGraph} />)}
        </div>
    );
}
