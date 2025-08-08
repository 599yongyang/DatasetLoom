import { fetcher } from '@/lib/utils';
import useSWRInfinite from 'swr/infinite';
import type { Chat } from '@/types/interfaces';
import useSWR from 'swr';

export function useGetChatHistory(projectId: string) {
    const getKey = (pageIndex: number, previousPageData: ChatHistory | null) =>
        getChatHistoryPaginationKey(pageIndex, previousPageData, projectId);

    const { data, setSize, isValidating, isLoading, mutate } = useSWRInfinite<ChatHistory>(getKey, fetcher, {
        fallbackData: []
    });

    return {
        data,
        setSize,
        isValidating,
        isLoading,
        mutate
    };
}

export function useGetChatById(id: string, projectId: string) {
    const { data, error, isLoading, mutate } = useSWR(`/${projectId}/chat/info?id=${id}`, fetcher);
    return {
        data: data || [],
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}

export function useGetMessagesByChatId(chatId: string, projectId: string) {
    const { data, error, isLoading, mutate } = useSWR(`/${projectId}/chat/messages?chatId=${chatId}`, fetcher);
    return {
        data: data || [],
        isLoading: !error && !data,
        isError: !!error,
        refresh: mutate
    };
}

const PAGE_SIZE = 20;

interface ChatHistory {
    chats: Chat[];
    hasMore: boolean;
}

export function getChatHistoryPaginationKey(
    pageIndex: number,
    previousPageData: ChatHistory | null,
    projectId: string
): string | null {
    // 如果没有更多数据，停止请求
    if (previousPageData && !previousPageData.hasMore) {
        return null;
    }

    // 第一页
    if (pageIndex === 0) {
        return `/${projectId}/chat/history?limit=${PAGE_SIZE}`;
    }

    // 后续页：获取上一页最后一条记录的 id
    const lastChat = previousPageData?.chats.at(-1);
    if (!lastChat) return null;

    return `/${projectId}/chat/history?ending_before=${lastChat.id}&limit=${PAGE_SIZE}`;
}
