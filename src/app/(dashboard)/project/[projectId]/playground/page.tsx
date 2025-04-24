'use client';

import { useChat } from '@ai-sdk/react';
import { useParams } from 'next/navigation';
import { selectedModelInfoAtom } from '@/atoms';
import { useAtomValue } from 'jotai';
import { Messages } from '@/components/playground/messages';
import { MultimodalInput } from '@/components/playground/multimodal-input';
import type { Attachment } from 'ai';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Page() {
    const { projectId }: { projectId: string } = useParams();
    const model = useAtomValue(selectedModelInfoAtom);
    const { messages, setMessages, handleSubmit, input, setInput, append, status, stop, reload } = useChat({
        api: `/api/project/${projectId}/playground/chat/stream`,
        body: {
            model
        },
        onError: error => {
            console.error(error);
            toast.error(error ? error.message : 'An error occurred, please try again!');
        }
    });
    const [attachments, setAttachments] = useState<Array<Attachment>>([]);

    return (
        <div className={'h-[87vh]'}>
            <div className="flex flex-col min-w-0 h-full bg-background">
                <Messages status={status} messages={messages} setMessages={setMessages} reload={reload} />

                <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
                    <MultimodalInput
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
                </form>
            </div>
        </div>
    );
}
