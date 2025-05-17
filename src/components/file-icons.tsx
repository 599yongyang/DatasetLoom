// components/FileIcon.tsx
import React from 'react';
import {
    FileIcon as FileIconLucide,
    FileTextIcon,
    FileArchiveIcon,
    FileSpreadsheetIcon,
    VideoIcon,
    HeadphonesIcon,
    ImageIcon
} from 'lucide-react';
import { type Documents } from '@prisma/client';

export type FileLike = {
    fileExt?: string;
    fileName?: string;
};

export type FileIconProps = {
    file: File | FileLike;
    className?: string;
};

const getFileType = (file: File | FileLike): { type: string; name: string } => {
    if (file instanceof File) {
        return {
            type: file.type || '',
            name: file.name || ''
        };
    }

    return {
        type: file.fileExt || '',
        name: file.fileName || ''
    };
};

export default function FileIcons({ file, className = 'size-4 opacity-60' }: FileIconProps) {
    const { type, name } = getFileType(file);

    // 判断逻辑优化
    if (/\.pdf$/i.test(name) || /\/pdf/i.test(type)) {
        return <FileTextIcon className={className} />;
    }

    if (/\.zip$/i.test(name) || /\.rar$/i.test(name) || /\/zip/i.test(type) || /archive/i.test(type)) {
        return <FileArchiveIcon className={className} />;
    }

    if (/\.xls(x)?$/i.test(name) || /\/excel/i.test(type)) {
        return <FileSpreadsheetIcon className={className} />;
    }

    if (/^video\//i.test(type)) {
        return <VideoIcon className={className} />;
    }

    if (/^audio\//i.test(type)) {
        return <HeadphonesIcon className={className} />;
    }

    if (/^image\//i.test(type)) {
        return <ImageIcon className={className} />;
    }

    // 默认图标
    return <FileIconLucide className={className} />;
}
