'use client';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadFiles } from '@/components/documents/upload-files';

export function UploadDialog({ refreshFiles }: { refreshFiles?: () => void }) {
    const { t } = useTranslation('document');
    const [open, setOpen] = useState(false);
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
                <UploadFiles
                    type={'document'}
                    maxFiles={10}
                    refreshFiles={refreshFiles}
                    onClose={() => setOpen(false)}
                />
            </AlertDialogContent>
        </AlertDialog>
    );
}
