import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { CheckCircleFillIcon, LockIcon, MoreHorizontalIcon, ShareIcon, TrashIcon } from './icons';
import { memo, useState } from 'react';
import type { Chat } from '@/types/interfaces';
import { useParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { ChatVisibilityType } from '@repo/shared-types';
import { FileUp, Users } from 'lucide-react';
import * as React from 'react';
import { getSession, Session } from '@/lib/session';
import apiClient from '@/lib/axios';
import { toast } from 'sonner';
import { downloadDataset } from '@/lib/utils';

const PureChatItem = ({
                          chat,
                          isActive,
                          onDelete,
                          setOpenMobile
                      }: {
    chat: Chat;
    isActive: boolean;
    onDelete: (chatId: string) => void;
    setOpenMobile: (open: boolean) => void;
}) => {
    const { projectId }: { projectId: string } = useParams();
    const [session, setSession] = useState<Session | null>();
    React.useEffect(() => {
        const fetchSession = async () => {
            const sessionData = await getSession();
            setSession(sessionData);
        };

        fetchSession();
    }, []);
    const { visibilityType, setVisibilityType } = useChatVisibility({
        projectId: projectId,
        chatId: chat.id,
        initialVisibility: chat.visibility as ChatVisibilityType
    });
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link href={`/project/${projectId}/chat/${chat.id}`} onClick={() => setOpenMobile(false)}>
                    {chat.visibility === ChatVisibilityType.PRIVATE ? <LockIcon size={12} /> : <Users size={12} />}

                    <span>{chat.title}</span>
                </Link>
            </SidebarMenuButton>

            {session?.user?.id === chat.userId && (
                <DropdownMenu modal={true}>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuAction
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
                            showOnHover={!isActive}
                        >
                            <MoreHorizontalIcon />
                            <span className="sr-only">更多</span>
                        </SidebarMenuAction>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent side="bottom" align="end">
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="cursor-pointer">
                                <ShareIcon />
                                <span>分享</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem
                                        className="cursor-pointer flex-row justify-between"
                                        onClick={() => {
                                            setVisibilityType(ChatVisibilityType.PRIVATE);
                                        }}
                                    >
                                        <div className="flex flex-row gap-2 items-center">
                                            <LockIcon size={12} />
                                            <span>个人可见</span>
                                        </div>
                                        {visibilityType === ChatVisibilityType.PRIVATE ? <CheckCircleFillIcon /> : null}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer flex-row justify-between"
                                        onClick={() => {
                                            setVisibilityType(ChatVisibilityType.PUBLIC);
                                        }}
                                    >
                                        <div className="flex flex-row gap-2 items-center">
                                            <Users className="text-black" />
                                            <span>成员可见</span>
                                        </div>
                                        {visibilityType === ChatVisibilityType.PUBLIC ? <CheckCircleFillIcon /> : null}
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => exportDatasetsLocal(projectId, chat.id)}
                        >
                            <FileUp className={'text-black'} />
                            <span>导出</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
                            onSelect={() => onDelete(chat.id)}
                        >
                            <TrashIcon />
                            <span>删除</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </SidebarMenuItem>
    );
};

// 导出数据集到本地
const exportDatasetsLocal = async (projectId: string, chatId: string) => {
    await downloadDataset({
        url: `/${projectId}/chat/export`,
        params: { chatId }
    });
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
    if (prevProps.isActive !== nextProps.isActive) return false;
    return true;
});
