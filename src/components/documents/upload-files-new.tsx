import { AlertCircleIcon, FileUpIcon, XIcon } from 'lucide-react';
import {
    type FileMetadata,
    type FileUploadOptions,
    type FileWithPreview,
    formatBytes,
    useFileUpload
} from '@/hooks/use-file-upload';
import FileIcons from '@/components/file-icons';
import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import axios from 'axios';
import { useAtom, useSetAtom } from 'jotai';
import { documentWorkFlowAtom } from '@/atoms/workflow';

export function UploadFilesNew({
    options,
    setLocalFiles
}: {
    options: FileUploadOptions;
    setLocalFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) {
    const { t } = useTranslation('document');
    const maxSize = 100 * 1024 * 1024; // 10MB default
    options.maxSize ??= maxSize;
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
    ] = useFileUpload(options);

    const handleRemoveFile = (id: string) => {
        removeFile(id);
    };

    const handleClear = () => {
        clearFiles();
    };

    useEffect(() => {
        setLocalFiles(files.map(file => file.file as File));
    }, [files]);

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
                            {t('upload_dialog.limitation', {
                                maxFiles: options.maxFiles,
                                maxSize: formatBytes(options.maxSize)
                            })}
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
        </div>
    );
}
