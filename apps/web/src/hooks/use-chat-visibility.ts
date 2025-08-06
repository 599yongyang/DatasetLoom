'use client';

import { useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import type { ChatHistory } from '@/components/chat/sidebar-history';
import { useGetChatHistory } from '@/hooks/query/use-chat';
import { ChatVisibilityType } from '@prisma-enum';
import apiClient from "@/lib/axios";

export function useChatVisibility({
    projectId,
    chatId,
    initialVisibility
}: {
    projectId: string;
    chatId: string;
    initialVisibility: ChatVisibilityType;
}) {
    const { cache } = useSWRConfig();
    const { mutate } = useGetChatHistory(projectId);
    const history: ChatHistory = cache.get(`/api/project/${projectId}/chat/history`)?.data;
    const { data: localVisibility, mutate: setLocalVisibility } = useSWR(`${chatId}-visibility`, null, {
        fallbackData: initialVisibility
    });

    const visibilityType = useMemo(() => {
        if (!history) return localVisibility;
        const chat = history.chats.find(chat => chat.id === chatId);
        if (!chat) return ChatVisibilityType.PRIVATE;
        return chat.visibility;
    }, [history, chatId, localVisibility]);

    const setVisibilityType = (updatedVisibilityType: ChatVisibilityType) => {
       void setLocalVisibility(updatedVisibilityType);
        apiClient.patch(`/${projectId}/chat/set-visible`, {
                chatId,
                visibility: updatedVisibilityType
            })
            .then(() => {
                mutate(undefined, true);
            });
    };

    return { visibilityType, setVisibilityType };
}
