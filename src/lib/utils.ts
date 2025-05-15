import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
    info: string;
    status: number;
}

export const fetcher = async (url: string) => {
    const res = await fetch(url);

    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.') as ApplicationError;

        error.info = await res.json();
        error.status = res.status;

        throw error;
    }

    return res.json();
};

export const fetcherPost = async (url: string, body: any) => {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error('请求失败');

    return res.json();
};

export function isEmptyObject(obj: any): boolean {
    return obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0;
}

export function buildURL(base: string, params: Record<string, string | number | boolean>) {
    const search = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    return search ? `${base}?${search}` : base;
}
