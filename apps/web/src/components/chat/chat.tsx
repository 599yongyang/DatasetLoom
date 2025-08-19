'use client';

import type { Attachment, UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { cn, fetcher } from '@/lib/utils';
import { toast } from 'sonner';
import { unstable_serialize } from 'swr/infinite';
import type { ChatMessageVote } from '@/types/interfaces';
import { nanoid } from 'nanoid';
import type { ChatHistory } from '@/components/chat/sidebar-history';
import { getChatHistoryPaginationKey } from '@/hooks/query/use-chat';
import { useParams } from 'next/navigation';
import { useAtomValue } from 'jotai/index';
import { selectedModelInfoAtom } from '@/atoms';
import { BACKEND_URL } from '@/constants/config';
import { getSession, Session } from '@/lib/session';
import * as React from 'react';
import { Conversation, ConversationContent, ConversationScrollButton } from '../ai-elements/conversation';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai-elements/source';
import { Message, MessageAvatar, MessageContent } from '@/components/ai-elements/message';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import {
    PromptInput, PromptInputButton, PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools
} from '@/components/ai-elements/prompt-input';
import { Response } from '@/components/ai-elements/response';
import { ChevronDownIcon, CopyIcon, FileSearch2, GlobeIcon, RefreshCcwIcon, ScanSearch } from 'lucide-react';
import { Greeting } from '@/components/chat/greeting';
import { MessageActions } from '@/components/chat/message-actions';
import { Action, Actions } from '../ai-elements/actions';

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
    const [isRAG, setIsRAG] = useState(false);
    const [session, setSession] = useState<Session | null>();

    React.useEffect(() => {
        const fetchSession = async () => {
            const sessionData = await getSession();
            setSession(sessionData);
        };

        fetchSession();
    }, []);

    const { messages, setMessages, handleSubmit, input, setInput, append, status, stop, reload } = useChat({
        api: `${BACKEND_URL}api/${projectId}/chat`,
        id,
        body: { id, modelConfigId: model.id, isRAG },
        headers: {
            'authorization': `Bearer ${session?.accessToken}`
        },
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
        messages.length >= 2 && id ? `/${projectId}/chat/vote?chatId=${id}` : null,
        fetcher
    );

    const [attachments, setAttachments] = useState<Array<Attachment>>([]);

    return (
        <div className="flex flex-col min-w-0 h-[87vh] p-5">
            <Conversation className="h-full ">
                <ConversationContent>
                    {messages.map((message) => (
                        <div key={message.id}>
                            {message.role === 'assistant' && (
                                <Sources>
                                    {message.parts.map((part, i) => {
                                        switch (part.type) {
                                            case 'source':
                                                return (
                                                    <>
                                                        <SourcesTrigger
                                                            count={
                                                                message.parts.filter(
                                                                    (part) => part.type === 'source'
                                                                ).length
                                                            }
                                                        />
                                                        <SourcesContent key={`${message.id}-${i}`}>
                                                            <Source
                                                                key={`${message.id}-${i}`}
                                                                href={part.source.url}
                                                                title={part.source.title}
                                                            />
                                                        </SourcesContent>
                                                    </>
                                                );
                                        }
                                    })}
                                </Sources>
                            )}
                            <Message from={message.role} key={message.id}>
                                <MessageContent>
                                    {message.parts.map((part, i) => {
                                        switch (part.type) {
                                            case 'text':
                                                return (
                                                    <div key={`${message.id}-${i}`}>
                                                        <Response key={`${message.id}-${i}`}>
                                                            {part.text}
                                                        </Response>

                                                    </div>
                                                );
                                            case 'reasoning':
                                                return (
                                                    <Reasoning
                                                        key={`${message.id}-${i}`}
                                                        className="w-full"
                                                        isStreaming={status === 'streaming'}
                                                    >
                                                        <ReasoningTrigger>
                                                            {part.details && (
                                                                <div>思考完成</div>
                                                            )}
                                                        </ReasoningTrigger>
                                                        <ReasoningContent>{part.reasoning}</ReasoningContent>
                                                    </Reasoning>
                                                );
                                            default:
                                                return null;
                                        }
                                    })}
                                </MessageContent>
                            </Message>
                        </div>
                    ))}
                    {status === 'submitted' && <Loader />}
                </ConversationContent>
                <ConversationScrollButton />
            </Conversation>

            <PromptInput onSubmit={handleSubmit} className="mt-4">
                <PromptInputTextarea
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                />
                <PromptInputToolbar>
                    <PromptInputTools>
                        <PromptInputButton
                            variant={isRAG ? 'default' : 'ghost'}
                            onClick={() => setIsRAG(!isRAG)}
                        >
                            <ScanSearch size={16} />
                            <span>RAG</span>
                        </PromptInputButton>

                    </PromptInputTools>
                    <PromptInputSubmit disabled={!input} status={status} />
                </PromptInputToolbar>
            </PromptInput>
        </div>
    );
}
