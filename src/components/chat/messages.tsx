import type { UIMessage } from 'ai';
import { PreviewMessage, ThinkingMessage } from './message';
import { useScrollToBottom } from './use-scroll-to-bottom';
import { Greeting } from './greeting';
import { memo } from 'react';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { ChatMessageVote } from '@prisma/client';

interface MessagesProps {
    chatId: string;
    status: UseChatHelpers['status'];
    votes: Array<ChatMessageVote> | undefined;
    messages: Array<UIMessage>;
    setMessages: UseChatHelpers['setMessages'];
    reload: UseChatHelpers['reload'];
    isReadonly: boolean;
}

function PureMessages({ chatId, status, votes, messages, setMessages, reload, isReadonly }: MessagesProps) {
    const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

    return (
        <div ref={messagesContainerRef} className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-10">
            {messages.length === 0 && <Greeting />}

            {messages.map((message, index) => (
                <PreviewMessage
                    key={message.id}
                    chatId={chatId}
                    message={message}
                    isLoading={status === 'streaming' && messages.length - 1 === index}
                    vote={votes ? votes.find(vote => vote.messageId === message.id) : undefined}
                    setMessages={setMessages}
                    reload={reload}
                    isReadonly={isReadonly}
                />
            ))}

            {status === 'submitted' && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
                <ThinkingMessage />
            )}

            <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]"></div>
        </div>
    );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
    if (prevProps.status !== nextProps.status) return false;
    if (prevProps.status && nextProps.status) return false;
    if (prevProps.messages.length !== nextProps.messages.length) return false;
    if (!equal(prevProps.messages, nextProps.messages)) return false;
    if (!equal(prevProps.votes, nextProps.votes)) return false;

    return true;
});
