'use client';

import {
    AlertCircleIcon,
    FileArchiveIcon,
    FileIcon,
    FileSpreadsheetIcon,
    FileTextIcon,
    FileUpIcon,
    HeadphonesIcon,
    ImageIcon,
    Upload,
    VideoIcon,
    XIcon
} from 'lucide-react';

import { formatBytes, useFileUpload } from '@/hooks/use-file-upload';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const getFileIcon = (file: { file: File | { type: string; name: string } }) => {
    const fileType = file.file instanceof File ? file.file.type : file.file.type;
    const fileName = file.file instanceof File ? file.file.name : file.file.name;

    if (
        fileType.includes('pdf') ||
        fileName.endsWith('.pdf') ||
        fileType.includes('word') ||
        fileName.endsWith('.doc') ||
        fileName.endsWith('.docx')
    ) {
        return <FileTextIcon className="size-4 opacity-60" />;
    } else if (
        fileType.includes('zip') ||
        fileType.includes('archive') ||
        fileName.endsWith('.zip') ||
        fileName.endsWith('.rar')
    ) {
        return <FileArchiveIcon className="size-4 opacity-60" />;
    } else if (fileType.includes('excel') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        return <FileSpreadsheetIcon className="size-4 opacity-60" />;
    } else if (fileType.includes('video/')) {
        return <VideoIcon className="size-4 opacity-60" />;
    } else if (fileType.includes('audio/')) {
        return <HeadphonesIcon className="size-4 opacity-60" />;
    } else if (fileType.startsWith('image/')) {
        return <ImageIcon className="size-4 opacity-60" />;
    }
    return <FileIcon className="size-4 opacity-60" />;
};

export function UploadFile({ refreshFiles }: { refreshFiles: () => void }) {
    const { projectId } = useParams();
    const { t } = useTranslation('document');
    const [open, setOpen] = useState(false);
    const maxSize = 100 * 1024 * 1024; // 10MB default
    const maxFiles = 10;

    const [
        { files, isDragging, errors },
        {
            handleDragEnter,
            handleDragLeave,
            handleDragOver,
            handleDrop,
            openFileDialog,
            removeFile,
            clearFiles,
            getInputProps
        }
    ] = useFileUpload({
        multiple: true,
        maxFiles,
        maxSize,
        accept: '.docx,.doc,.pdf,.md,.epub,.txt'
    });

    const handleUpload = async () => {
        console.log(files);
        if (files.length === 0) {
            toast.error('请先选择文件');
            return;
        }

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file.file as File);
        });

        try {
            toast.promise(axios.post(`/api/project/${projectId}/documents`, formData), {
                loading: `上传文件中...`,
                success: data => {
                    setOpen(false);
                    refreshFiles();
                    return `成功上传 ${data.data.files.length} 个文件`;
                },
                error: error => {
                    return error.response?.data?.message || '批量删除问题失败';
                }
            });
        } catch (e) {
            console.error(e);
            toast.error('上传失败');
        }
    };
    useEffect(() => {
        clearFiles();
    }, [open]);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className={'hover:cursor-pointer'}>
                    <Upload size={30} />
                    <span className="hidden lg:inline ">{t('upload_btn')}</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogTitle>
                    <span className="sr-only">上传文件</span>
                </AlertDialogTitle>
                <div>
                    <div className="flex flex-col gap-2">
                        {/* Drop area */}
                        <div
                            role="button"
                            onClick={openFileDialog}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            data-dragging={isDragging || undefined}
                            className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
                        >
                            <input {...getInputProps()} className="sr-only" aria-label="Upload files" />

                            <div className="flex flex-col items-center justify-center text-center">
                                <div
                                    className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                                    aria-hidden="true"
                                >
                                    <FileUpIcon className="size-4 opacity-60" />
                                </div>
                                <p className="mb-1.5 text-sm font-medium">{t('upload_btn')}</p>
                                <p className="text-muted-foreground mb-2 text-xs">{t('upload_dialog.prompt')}</p>
                                <div className="text-muted-foreground/70 flex flex-wrap justify-center gap-1 text-xs">
                                    {t('upload_dialog.limitation', { maxFiles, maxSize: formatBytes(maxSize) })}
                                </div>
                            </div>
                        </div>

                        {errors.length > 0 && (
                            <div className="text-destructive flex items-center gap-1 text-xs" role="alert">
                                <AlertCircleIcon className="size-3 shrink-0" />
                                <span>{errors[0]}</span>
                            </div>
                        )}

                        {/* File list */}
                        {files.length > 0 && (
                            <div className="space-y-2">
                                {files.map(file => (
                                    <div
                                        key={file.id}
                                        className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                                                {getFileIcon(file)}
                                            </div>
                                            <div className="flex min-w-0 flex-col gap-0.5">
                                                <p className="truncate text-[13px] font-medium">
                                                    {file.file instanceof File ? file.file.name : file.file.name}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {formatBytes(
                                                        file.file instanceof File ? file.file.size : file.file.size
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                                            onClick={() => removeFile(file.id)}
                                            aria-label="Remove file"
                                        >
                                            <XIcon className="size-4" aria-hidden="true" />
                                        </Button>
                                    </div>
                                ))}

                                {/* Remove all files button */}
                                {files.length > 1 && (
                                    <div>
                                        <Button size="sm" variant="outline" onClick={clearFiles}>
                                            {t('upload_dialog.rm_all_btn')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <AlertDialogFooter className={'mt-4'}>
                        <AlertDialogCancel>{t('upload_dialog.cancel_btn')}</AlertDialogCancel>
                        <Button onClick={handleUpload}>{t('upload_dialog.confirm_upload_btn')}</Button>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
