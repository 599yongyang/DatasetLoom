'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import type { UIMessage } from 'ai';
import { SidebarHistory } from '@/components/chat/sidebar-history';
import * as React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Chat } from '@/components/chat/chat';
import { useGetChatById, useGetMessagesByChatId } from '@/hooks/query/use-chat';
import type { ChatMessages } from '@/types/interfaces';
import { useAtomValue } from 'jotai/index';
import { userInfoAtom } from '@/atoms';

export default function Page() {
    const { projectId, id }: { projectId: string; id: string } = useParams();
    const router = useRouter();
    const userInfo = useAtomValue(userInfoAtom);
    const { data: chat } = useGetChatById(id, projectId);

    if (!chat) {
        notFound();
    }

    const { data: messagesData } = useGetMessagesByChatId(id, projectId);

    function convertToUIMessages(messages: Array<ChatMessages>): Array<UIMessage> {
        return messages.map(message => ({
            id: message.id,
            parts: JSON.parse(message.parts) as UIMessage['parts'],
            role: message.role as UIMessage['role'],
            content: '',
            createdAt: message.createdAt,
            experimental_attachments: []
        }));
    }

    return (
        <div className="@container/main flex h-[87vh]">
            <ResizablePanelGroup direction="horizontal" className=" rounded-lg border">
                <ResizablePanel maxSize={20} defaultSize={20}>
                    <div className="flex flex-col min-w-0 p-3 bg-background">
                        <Button
                            onClick={() => {
                                router.push(`/project/${projectId}/chat`);
                            }}
                        >
                            新建对话
                        </Button>
                    </div>
                    <SidebarHistory />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={80}>
                    <Chat
                        id={chat.id}
                        initialMessages={convertToUIMessages(messagesData)}
                        isReadonly={userInfo.id !== chat.userId}
                    />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
