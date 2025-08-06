import { AlertCircleIcon, FileUpIcon, XIcon } from 'lucide-react';
import { type FileMetadata, formatBytes, useFileUpload } from '@/hooks/use-file-upload';
import FileIcons from '@/components/common/file-icons';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAtom, useSetAtom } from 'jotai';
import { documentWorkFlowAtom } from '@/atoms/workflow';
import apiClient from "@/lib/axios";

export function UploadFiles({
    type,
    initialFiles,
    maxFiles,
    onClose,
    refreshFiles
}: {
    type: 'document' | 'workflow';
    initialFiles?: FileMetadata[];
    maxFiles: number;
    onClose?: () => void;
    refreshFiles?: () => void;
}) {
    const { projectId } = useParams();
    const { t } = useTranslation('knowledge');
    const [documentWorkFlow, setDocumentWorkFlow] = useAtom(documentWorkFlowAtom);
    const maxSize = 100 * 1024 * 1024; // 10MB default

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
        initialFiles,
        multiple: true,
        maxFiles,
        maxSize,
        accept: '.docx,.doc,.pdf,.md,.epub,.txt'
    });

    const handleRemoveFile = (id: string) => {
        if (type === 'workflow' && documentWorkFlow) {
            setDocumentWorkFlow(prev => ({
                ...prev,
                data: prev?.data?.filter(d => d.id !== id) ?? null
            }));
        }
        removeFile(id);
    };

    const handleClear = () => {
        clearFiles();
        if (type === 'workflow') {
            setDocumentWorkFlow({ data: [] });
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error('请先选择文件');
            return;
        }

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file.file as File);
        });

        try {
            toast.promise(apiClient.post(`/${projectId}/documents`, formData), {
                loading: `上传文件中...`,
                success: data => {
                    if (type === 'document') {
                        if (onClose) onClose();
                        if (refreshFiles) refreshFiles();
                    } else {
                        setDocumentWorkFlow(prev => ({
                            ...prev,
                            data: data.data.files
                        }));
                    }

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
    return (
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
                                        <FileIcons file={file.file as File} />
                                    </div>
                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <p className="truncate text-[13px] font-medium">
                                            {file.file instanceof File ? file.file.name : file.file.name}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {formatBytes(file.file instanceof File ? file.file.size : file.file.size)}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                                    onClick={() => handleRemoveFile(file.id)}
                                    aria-label="Remove file"
                                >
                                    <XIcon className="size-4" aria-hidden="true" />
                                </Button>
                            </div>
                        ))}

                        {/* Remove all files button */}
                        {files.length > 1 && (
                            <div>
                                <Button size="sm" variant="outline" onClick={handleClear}>
                                    {t('upload_dialog.rm_all_btn')}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
                {type === 'document' && <Button onClick={onClose}>{t('upload_dialog.cancel_btn')}</Button>}
                {files.length > 0 && <Button onClick={handleUpload}>{t('upload_dialog.confirm_upload_btn')}</Button>}
            </div>
        </div>
    );
}
