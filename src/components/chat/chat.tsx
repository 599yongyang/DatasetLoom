'use client';

import type { Attachment, UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { fetcher } from '@/lib/utils';
import { MultimodalInput } from '@/components/chat/multimodal-input';
import { Messages } from '@/components/chat/messages';
import { toast } from 'sonner';
import { unstable_serialize } from 'swr/infinite';
import type { ChatMessageVote } from '@prisma/client';
import { nanoid } from 'nanoid';
import type { ChatHistory } from '@/components/chat/sidebar-history';
import { getChatHistoryPaginationKey } from '@/hooks/query/use-chat';
import { useParams } from 'next/navigation';
import { useAtomValue } from 'jotai/index';
import { selectedModelInfoAtom } from '@/atoms';

export function Chat({
    id,
    initialMessages,
    isReadonly
}: {
    id: string;
    initialMessages: Array<UIMessage>;
    isReadonly: boolean;
}) {
    const { projectId }: { projectId: string } = useParams();
    const { mutate } = useSWRConfig();
    const model = useAtomValue(selectedModelInfoAtom);
    const { messages, setMessages, handleSubmit, input, setInput, append, status, stop, reload } = useChat({
        api: `/api/project/${projectId}/chat`,
        id,
        body: { id, model },
        initialMessages,
        experimental_throttle: 100,
        sendExtraMessageFields: true,
        generateId: nanoid,
        onFinish: () => {
            const getKey = (pageIndex: number, previousPageData: ChatHistory | null) =>
                getChatHistoryPaginationKey(pageIndex, previousPageData, projectId);

            void mutate(unstable_serialize(getKey));
        },
        onError: () => {
            toast.error('An error occurred, please try again!');
        }
    });

    const { data: votes } = useSWR<Array<ChatMessageVote>>(
        messages.length >= 2 && id ? `/api/project/${projectId}/chat/vote?chatId=${id}` : null,
        fetcher
    );

    const [attachments, setAttachments] = useState<Array<Attachment>>([]);

    return (
        <>
            <div className="flex flex-col min-w-0 h-dvh bg-background">
                <Messages
                    chatId={id}
                    status={status}
                    votes={votes}
                    messages={messages}
                    setMessages={setMessages}
                    reload={reload}
                    isReadonly={isReadonly}
                />

                <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
                    {!isReadonly && (
                        <MultimodalInput
                            chatId={id}
                            input={input}
                            setInput={setInput}
                            handleSubmit={handleSubmit}
                            status={status}
                            stop={stop}
                            attachments={attachments}
                            setAttachments={setAttachments}
                            messages={messages}
                            setMessages={setMessages}
                            append={append}
                        />
                    )}
                </form>
            </div>
        </>
    );
}
