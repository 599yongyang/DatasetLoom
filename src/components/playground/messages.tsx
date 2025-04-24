import type { UIMessage } from 'ai';
import { PreviewMessage, ThinkingMessage } from './message';
import { useScrollToBottom } from '@/components/playground/use-scroll-to-bottom';
import { Greeting } from './greeting';
import { memo } from 'react';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';

interface MessagesProps {
    status: UseChatHelpers['status'];
    messages: Array<UIMessage>;
    setMessages: UseChatHelpers['setMessages'];
    reload: UseChatHelpers['reload'];
}

function PureMessages({ status, messages, setMessages, reload }: MessagesProps) {
    const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
    return (
        <div ref={messagesContainerRef} className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4">
            {messages.length === 0 && <Greeting />}

            {messages.map((message, index) => (
                <PreviewMessage
                    key={message.id}
                    message={message}
                    isLoading={status === 'streaming' && messages.length - 1 === index}
                    setMessages={setMessages}
                    reload={reload}
                />
            ))}

            {status === 'submitted' && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
                <ThinkingMessage />
            )}

            <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
        </div>
    );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
    if (prevProps.status !== nextProps.status) return false;
    if (prevProps.status && nextProps.status) return false;
    if (prevProps.messages.length !== nextProps.messages.length) return false;
    if (!equal(prevProps.messages, nextProps.messages)) return false;

    return true;
});
