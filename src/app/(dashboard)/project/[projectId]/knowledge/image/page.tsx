'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SquareSplitVertical, Trash2, Upload } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table/data-table';
import { ChunkStrategyDialog } from '@/components/chunks/chunk-strategy-dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { ProjectRole } from '@/server/db/types';
import { WithPermission } from '@/components/common/permission-wrapper';
import { useImages } from '@/hooks/query/use-images';
import UploadImageDialog from '@/components/images/upload-dialog';
import { useImagesTableColumns } from '@/hooks/table-columns/use-image';

export default function Page() {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('document');

    const [fileName, setFileName] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });
    const {
        data,
        total,
        refresh: refreshFiles
    } = useImages({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        fileName
    });
    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const [rowSelection, setRowSelection] = useState({});
    const columns = useImagesTableColumns({ mutateImages: refreshFiles });
    const [fileIds, setFileIds] = useState<string[]>([]);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const handleBatchDeleteDocuments = () => {
        toast.promise(
            axios.delete(`/api/project/${projectId}/documents`, {
                data: { documentIds: Object.keys(rowSelection) }
            }),
            {
                loading: '数据删除中',
                success: _ => {
                    void refreshFiles();
                    return '删除成功';
                },
                error: error => {
                    return error.response?.data?.message || '删除失败';
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

                    <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                        <Button onClick={() => setUploadOpen(true)}>
                            <Upload size={30} />
                            {t('upload_btn')}
                        </Button>
                    </WithPermission>
                </div>
                <div className={'flex items-center gap-2'}>
                    <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                        <ChunkStrategyDialog
                            fileIds={fileIds}
                            fileExt={''}
                            open={open}
                            onOpenChange={setOpen}
                            refresh={refreshFiles}
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
                            onClick={handleBatchDeleteDocuments}
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
            <UploadImageDialog open={uploadOpen} setOpen={setUploadOpen} refreshFiles={refreshFiles} />
        </div>
    );
}
