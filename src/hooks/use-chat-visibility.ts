'use client';

import { useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { unstable_serialize } from 'swr/infinite';
// import { updateChatVisibility } from '@/app/(chat)/actions';

import type { VisibilityType } from '@/components/chat/visibility-selector';
import type { ChatHistory } from '@/components/chat/sidebar-history';
import { getChatHistoryPaginationKey } from '@/hooks/query/use-chat';
import { useParams } from 'next/navigation';

export function useChatVisibility({
    chatId,
    initialVisibility
}: {
    chatId: string;
    initialVisibility: VisibilityType;
}) {
    const { mutate, cache } = useSWRConfig();
    const history: ChatHistory = cache.get('/api/history')?.data;
    const { projectId }: { projectId: string } = useParams();

    const { data: localVisibility, mutate: setLocalVisibility } = useSWR(`${chatId}-visibility`, null, {
        fallbackData: initialVisibility
    });

    const visibilityType = useMemo(() => {
        if (!history) return localVisibility;
        const chat = history.chats.find(chat => chat.id === chatId);
        if (!chat) return 'private';
        return chat.visibility;
    }, [history, chatId, localVisibility]);

    const setVisibilityType = (updatedVisibilityType: VisibilityType) => {
        setLocalVisibility(updatedVisibilityType);
        const getKey = (pageIndex: number, previousPageData: ChatHistory | null) =>
            getChatHistoryPaginationKey(pageIndex, previousPageData, projectId);

        mutate(unstable_serialize(getKey));

        // updateChatVisibility({
        //   chatId: chatId,
        //   visibility: updatedVisibilityType,
        // });
    };

    return { visibilityType, setVisibilityType };
}
