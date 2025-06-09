'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SquareSplitVertical, Trash2, Upload, Waypoints } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table/data-table';
import { useDocumentsTableColumns } from '@/components/documents/table-columns';
import { useDocuments } from '@/hooks/query/use-documents';
import { UploadDialog } from '@/components/documents/upload-dialog';
import { ChunkStrategyDialog } from '@/components/chunks/chunk-strategy-dialog';
import { toast } from 'sonner';
import axios from 'axios';

const fileType = [
    {
        value: 'pdf',
        label: 'PDF'
    },
    {
        value: 'txt',
        label: 'TXT'
    },
    {
        value: 'doc',
        label: 'DOC'
    },
    {
        value: 'md',
        label: 'MD'
    },
    {
        value: 'epub',
        label: 'EPUB'
    }
];

export default function Page() {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('document');
    const router = useRouter();
    const [fileName, setFileName] = useState('');
    const [fileExt, setFileExt] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });
    const {
        data,
        total,
        refresh: refreshFiles
    } = useDocuments({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        fileName,
        fileExt: fileExt === 'all' ? '' : fileExt
    });
    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const [rowSelection, setRowSelection] = useState({});
    const columns = useDocumentsTableColumns({ mutateDocuments: refreshFiles });
    const [fileIds, setFileIds] = useState<string[]>([]);
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
                    <Select
                        value={fileExt}
                        onValueChange={value => {
                            setFileExt(value);
                            setPagination({ ...pagination, pageIndex: 0 });
                        }}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder={t('file_ext')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('file_ext_all')}</SelectItem>
                            {fileType.map(item => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/*<UploadDialog refreshFiles={refreshFiles} />*/}
                    <Button onClick={() => router.push(`/project/${projectId}/documents/upload`)}>
                        <Upload size={30} />
                        上传资源
                    </Button>
                    <Button
                        variant="outline"
                        className={'hover:cursor-pointer'}
                        onClick={() => router.push(`/project/${projectId}/graph`)}
                    >
                        <Waypoints size={30} />
                        <span className="hidden lg:inline ">{t('graph_btn')}</span>
                    </Button>
                </div>
                <div className={'flex items-center gap-2'}>
                    <ChunkStrategyDialog fileIds={fileIds} fileExt={''} open={open} onOpenChange={setOpen}>
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

                    <Button
                        variant="outline"
                        disabled={Object.keys(rowSelection).length == 0}
                        onClick={handleBatchDeleteDocuments}
                        className={'text-red-500 hover:cursor-pointer hover:text-red-500'}
                    >
                        <Trash2 size={30} />
                        <span className="hidden lg:inline ">{t('delete_btn')}</span>
                    </Button>
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
        </div>
    );
}
