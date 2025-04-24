import { Card } from '@/components/ui/card';
import { Cloud, Download, Eye, FileText, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatFileSize } from '@/lib/utils';
import type { UploadFiles } from '@prisma/client';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { useParams } from 'next/navigation';

export function FileSection({
    filteredFiles,
    selectedFiles,
    setSelectedFiles,
    setFileInput,
    fileInput,
    refreshFiles,
    total
}: {
    filteredFiles: UploadFiles[];
    selectedFiles: string[];
    setSelectedFiles: (selectedFiles: string[]) => void;
    setFileInput: (fileInput: string) => void;
    fileInput: string;
    refreshFiles: () => void;
    total: number;
}) {
    const { projectId } = useParams();
    const { t } = useTranslation('document');

    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    const onSelect = (id: string) => {
        if (selectedFiles.includes(id)) {
            // @ts-ignore
            setSelectedFiles(prev => prev.filter(fileId => fileId !== id));
        } else {
            // @ts-ignore
            setSelectedFiles(prev => [...prev, id]);
        }
    };

    const removePendingFile = (index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    // 处理文件选择
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        const MAX_FILE_SIZE = 50 * 1024 * 1024;

        const oversized = files.filter(f => f.size > MAX_FILE_SIZE);
        if (oversized.length > 0) {
            toast.error(`超过最大限制 50MB: ${oversized.map(f => f.name).join(', ')}`);
            return;
        }

        const validTypes = ['.md', '.txt', '.docx', '.pdf', '.html', '.png'];
        const validFiles = files.filter(f => validTypes.some(type => f.name.endsWith(type)));
        const invalid = files.filter(f => !validTypes.some(type => f.name.endsWith(type)));

        if (invalid.length > 0) {
            toast.warning('不支持部分文件格式');
        }

        if (validFiles.length > 0) {
            setPendingFiles(prev => [...prev, ...validFiles]);
        }
    };

    const handleStartUpload = async () => {
        if (pendingFiles.length === 0) {
            toast.error('请先选择文件');
            return;
        }

        const formData = new FormData();
        pendingFiles.forEach(file => {
            formData.append('file', file);
            formData.append('fileName', file.name);
        });

        try {
            await axios.post(`/api/project/${projectId}/files`, formData);
            await refreshFiles();
            setPendingFiles([]);
            toast.success('上传成功');
        } catch (e) {
            console.error(e);
            toast.error('上传失败');
        }
    };

    const onDelete = async (fileId: string) => {
        toast.promise(await axios.delete(`/api/project/${projectId}/files?fileId=${fileId}`), {
            loading: '数据删除中',
            success: _ => {
                refreshFiles();
                return '删除成功';
            },
            error: error => {
                return error.response?.data?.message || '删除失败';
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* Upload Section */}
            <Card className={'border-2 border-dashed rounded-lg'}>
                <div className="p-0">
                    {pendingFiles.length === 0 ? (
                        <div className=" flex flex-col items-center justify-center py-10 space-y-4 m-4">
                            <div className="rounded-full bg-primary/10 p-3">
                                <Cloud className="h-10 w-10 text-primary" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-lg ">{t('file.upload_text')}</p>
                            </div>
                            <div>
                                <label htmlFor="file-upload">
                                    <div>
                                        <Button
                                            className="mb-6 gap-2"
                                            onClick={() => document.getElementById('picture')?.click()}
                                        >
                                            <Upload className="h-4 w-4" />
                                            <Input
                                                hidden={true}
                                                id="picture"
                                                type="file"
                                                multiple // 支持多文件选择
                                                onChange={handleFileSelect}
                                            />
                                            {t('file.upload_btn')}
                                        </Button>
                                    </div>
                                </label>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">
                                        {' '}
                                        {t('file.pending_file_count', { count: pendingFiles.length })}
                                    </p>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => setPendingFiles([])}>
                                            {t('file.clear_btn')}
                                        </Button>
                                        <Button size="sm" onClick={handleStartUpload}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            {t('file.confirm_upload_btn')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <ScrollArea className="h-[200px]">
                                {pendingFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border-b">
                                        <div className="flex items-center space-x-3">
                                            <div>
                                                <p className="text-sm font-medium">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatFileSize(file.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removePendingFile(index)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </ScrollArea>
                            <div className="border-t pt-4 pl-2">
                                <input
                                    id="file-upload-more"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                                <label htmlFor="file-upload-more">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('file-upload-more')?.click()}
                                        className="cursor-pointer"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('file.add_more_btn')}
                                    </Button>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Files List Section */}
            <div className="border-1 rounded-lg max-h-90 overflow-auto">
                <div className="sticky top-0 z-20 p-5 bg-background flex flex-1 items-center justify-between border-b">
                    <h2 className="text-xl font-semibold w-1/2"> {t('file.uploaded_file_count', { count: total })}</h2>
                    <Input
                        placeholder={t('file.search')}
                        className="h-9 text-sm"
                        value={fileInput}
                        onChange={e => setFileInput(e.target.value)}
                    />
                </div>
                <ScrollArea className="h-[200px]">
                    {filteredFiles.map((file: UploadFiles) => (
                        <div
                            key={file.id}
                            className="flex items-center justify-between py-4 px-6 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Checkbox onCheckedChange={() => onSelect(file.id)} />
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium max-w-120 truncate">{file.fileName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatFileSize(file.size)} ·{' '}
                                            {new Date(file.createAt).toLocaleString('zh-CN')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Download className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(file.id)}
                                    className="h-8 w-8 text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </div>
        </div>
    );
}
