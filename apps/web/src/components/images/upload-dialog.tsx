'use client';

import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from 'lucide-react';

import { formatBytes, useFileUpload } from '@/hooks/use-file-upload';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import apiClient from '@/lib/axios';

export default function UploadImageDialog({
                                              open,
                                              setOpen,
                                              refreshFiles,
                                              modeId
                                          }: {
    open: boolean;
    setOpen: (open: boolean) => void;
    refreshFiles: () => void;
    modeId: string;
}) {
    const { projectId }: { projectId: string } = useParams();
    const maxSizeMB = 5;
    const maxSize = maxSizeMB * 1024 * 1024; // 5MB default
    const maxFiles = 6;

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
        accept: 'image/svg+xml,image/png,image/jpeg,image/jpg',
        maxSize,
        multiple: true,
        maxFiles
    });

    useEffect(() => {
        clearFiles();
    }, [open]);

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error('请先选择文件');
            return;
        }

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file.file as File);
        });
        toast.promise(apiClient.post(`/${projectId}/images/upload?mid=${modeId}`, formData), {
            loading: `上传文件中...`,
            success: res => {
                setOpen(false);
                refreshFiles();
                return `成功上传 ${res.data.data.length} 个文件`;
            },
            error: error => {
                console.error('Error:', error);
                return error.response?.data?.message || '上传文件失败';
            }
        });
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>上传图片</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                    {/* Drop area */}
                    <div
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        data-dragging={isDragging || undefined}
                        data-files={files.length > 0 || undefined}
                        className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
                    >
                        <input {...getInputProps()} className="sr-only" aria-label="Upload image file" />
                        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                            <div
                                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                                aria-hidden="true"
                            >
                                <ImageIcon className="size-4 opacity-60" />
                            </div>
                            <p className="mb-1.5 text-sm font-medium">Drop your images here</p>
                            <p className="text-muted-foreground text-xs">SVG, PNG, JPG (max. {maxSizeMB}MB)</p>
                            <Button variant="outline" className="mt-4" onClick={openFileDialog}>
                                <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
                                选择图片
                            </Button>
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
                                        <div className="bg-accent aspect-square shrink-0 rounded">
                                            <img
                                                src={file.preview}
                                                alt={file.file.name}
                                                className="size-10 rounded-[inherit] object-cover"
                                            />
                                        </div>
                                        <div className="flex min-w-0 flex-col gap-0.5">
                                            <p className="truncate text-[13px] font-medium">{file.file.name}</p>
                                            <p className="text-muted-foreground text-xs">
                                                {formatBytes(file.file.size)}
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
                                        <XIcon aria-hidden="true" />
                                    </Button>
                                </div>
                            ))}

                            {/* Remove all files button */}
                            {files.length > 1 && (
                                <div>
                                    <Button size="sm" variant="outline" onClick={clearFiles}>
                                        删除所有文件
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">取消</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleUpload} disabled={files.length === 0}>
                        确认
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
