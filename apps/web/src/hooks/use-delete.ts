import { useState } from 'react';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';
import { useTranslation } from 'react-i18next';

interface UseDeleteProps {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
}

interface DeleteResult {
    isDeleting: boolean;
    deleteItems: (url: string, ids: string[], props?: UseDeleteProps) => Promise<void>;
}

export function useDelete(): DeleteResult {
    const { t } = useTranslation('common');
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteItems = async (
        url: string,
        ids: string[],
        props?: UseDeleteProps
    ) => {
        if (ids.length === 0) {
            toast.error(t('messages.select_at_least_one'));
            return Promise.reject(new Error('No items selected'));
        }

        setIsDeleting(true);

        try {
            toast.promise(
                apiClient.delete(url, { params: { ids: ids.join(',') } }),
                {
                    loading: t('messages.delete_loading', { count: ids.length }),
                    success: () => {
                        props?.onSuccess?.();
                        return t('messages.delete_success', { count: ids.length });
                    },
                    error: (error) => {
                        props?.onError?.(error);
                        return error.message ?? t('messages.delete_fail');
                    }
                }
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return { isDeleting, deleteItems };
}
