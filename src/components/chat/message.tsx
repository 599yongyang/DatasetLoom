'use client';

import type { UIMessage } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';
import { SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import equal from 'fast-deep-equal';
import { cn } from '@/lib/utils';
import { MessageReasoning } from './message-reasoning';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { ChatMessageVote } from '@prisma/client';

const PurePreviewMessage = ({
    chatId,
    message,
    vote,
    isLoading,
    setMessages,
    reload,
    isReadonly
}: {
    chatId: string;
    message: UIMessage;
    vote: ChatMessageVote | undefined;
    isLoading: boolean;
    setMessages: UseChatHelpers['setMessages'];
    reload: UseChatHelpers['reload'];
    isReadonly: boolean;
}) => {
    const [mode, setMode] = useState<'view' | 'edit'>('view');

    return (
        <AnimatePresence>
            <motion.div
                data-testid={`message-${message.role}`}
                className="w-full mx-auto max-w-3xl px-4 group/message"
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                data-role={message.role}
            >
                <div
                    className={cn(
                        'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
                        {
                            'w-full': mode === 'edit',
                            'group-data-[role=user]/message:w-fit': mode !== 'edit'
                        }
                    )}
                >
                    {message.role === 'assistant' && (
                        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
                            <div className="translate-y-px">
                                <SparklesIcon size={14} />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 w-full">
                        {message.experimental_attachments && (
                            <div data-testid={`message-attachments`} className="flex flex-row justify-end gap-2">
                                {message.experimental_attachments.map(attachment => (
                                    <PreviewAttachment key={attachment.url} attachment={attachment} />
                                ))}
                            </div>
                        )}

                        {message.parts?.map((part, index) => {
                            const { type } = part;
                            const key = `message-${message.id}-part-${index}`;

                            if (type === 'reasoning') {
                                return <MessageReasoning key={key} isLoading={isLoading} reasoning={part.reasoning} />;
                            }

                            if (type === 'text') {
                                return (
                                    <div key={key} className="flex flex-row gap-2 items-start">
                                        <div
                                            data-testid="message-content"
                                            className={cn('flex flex-col gap-4', {
                                                'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
                                                    message.role === 'user'
                                            })}
                                        >
                                            <Markdown>{part.text}</Markdown>
                                        </div>
                                    </div>
                                );
                            }
                        })}

                        {!isReadonly && (
                            <MessageActions
                                key={`action-${message.id}`}
                                chatId={chatId}
                                message={message}
                                vote={vote}
                                isLoading={isLoading}
                            />
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export const PreviewMessage = memo(PurePreviewMessage, (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
});

export const ThinkingMessage = () => {
    const role = 'assistant';

    return (
        <motion.div
            data-testid="message-assistant-loading"
            className="w-full mx-auto max-w-3xl px-4 group/message "
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
            data-role={role}
        >
            <div
                className={cx(
                    'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
                    {
                        'group-data-[role=user]/message:bg-muted': true
                    }
                )}
            >
                <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
                    <SparklesIcon size={14} />
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col gap-4 text-muted-foreground">Hmm...</div>
                </div>
            </div>
        </motion.div>
    );
};
