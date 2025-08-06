import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as React from 'react';
import apiClient from '@/lib/axios';
import { ProjectRole } from '@prisma-enum';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
    info: string;
    status: number;
}

export const fetcher = async (url: string) => {
    try {
        const res = await apiClient.get(url);
        return res.data.data;
    } catch (error: any) {
        // 处理错误情况
        if (error.response) {
            const applicationError = new Error('An error occurred while fetching the data.') as ApplicationError;
            applicationError.info = error.response.data;
            applicationError.status = error.response.status;
            throw applicationError;
        }
        throw error;
    }
};

export function buildURL(base: string, params: Record<string, string | number | boolean>) {
    const search = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    return search ? `${base}?${search}` : base;
}


// 生成文件内容
export const generateFileContent = (data: any[], format: string) => {
    if (format === 'jsonl') {
        return {
            content: data.map(item => JSON.stringify(item)).join('\n'),
            extension: 'jsonl',
            mimeType: 'application/jsonl'
        };
    }
    return {
        content: JSON.stringify(data, null, 2),
        extension: 'json',
        mimeType: 'application/json'
    };
};


export function stringToColor(str: string, alpha: number = 1.0): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsla(${hue}, 70%, 50%, ${alpha})`;
}

export const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const el = e.currentTarget;
    if (e.deltaY > 0 && el.scrollTop >= el.scrollHeight - el.clientHeight) {
        return;
    }
    if (e.deltaY < 0 && el.scrollTop <= 0) {
        return;
    }
    e.preventDefault();
    el.scrollTop += e.deltaY;
};

export const hasPermission = (userRole: ProjectRole, requiredRole: ProjectRole): boolean => {
    const roleHierarchy: Record<ProjectRole, number> = {
        OWNER: 4,
        ADMIN: 3,
        EDITOR: 2,
        VIEWER: 1
    };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
