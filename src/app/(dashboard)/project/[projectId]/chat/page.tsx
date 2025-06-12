import { Chat } from '@/components/chat/chat';
import { nanoid } from 'nanoid';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { SidebarHistory } from '@/components/chat/sidebar-history';
import * as React from 'react';

export default async function Page() {
    const id = nanoid();
    return (
        <div className="@container/main flex h-[87vh]">
            <ResizablePanelGroup direction="horizontal" className=" rounded-lg border">
                <ResizablePanel maxSize={20} defaultSize={20}>
                    <div className="flex flex-col min-w-0 p-3 bg-background">
                        <Button>新建对话</Button>
                    </div>
                    <SidebarHistory />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={80}>
                    <div className="flex flex-col min-w-0 h-full bg-background">
                        <Chat key={id} id={id} initialMessages={[]} isReadonly={false} />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
