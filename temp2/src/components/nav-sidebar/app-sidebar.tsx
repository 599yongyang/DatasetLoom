'use client';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';
import { Send } from 'lucide-react';
import * as React from 'react';

import { NavMain } from '@/components/nav-sidebar/nav-main';
import { NavSecondary } from '@/components/nav-sidebar/nav-secondary';
import { getMenuConfig } from '@/constants/menus';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { NavDocuments } from '@/components/nav-sidebar/nav-documents';
import { useAtom } from 'jotai';
import { selectedProjectAtom } from '@/atoms';
import { NavUser } from '@/components/nav-sidebar/nav-user';
import type { CurrentUser } from '@/server/auth';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const navSecondary = [
    {
        title: 'Feedback',
        url: 'https://github.com/599yongyang/DatasetLoom/issues',
        icon: Send,
        external: true
    }
];

export function AppSidebar({ user }: { user: CurrentUser }) {
    const { data: session, status } = useSession();
    let { projectId }: { projectId: string } = useParams();
    const [localProjectId, setLocalProjectId] = useAtom(selectedProjectAtom);
    const [menuItems, setMenuItems] = useState(getMenuConfig(projectId, (session?.user as CurrentUser) || user));
    if (projectId !== 'undefined' && projectId !== undefined) {
        setTimeout(() => {
            setLocalProjectId(projectId);
        }, 0);
    } else {
        projectId = localProjectId;
    }

    useEffect(() => {
        setMenuItems(getMenuConfig(projectId, (session?.user as CurrentUser) || user));
    }, [projectId, session?.user || user]);
    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <div>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Image src="/logo.svg" width={200} height={200} alt="Picture of the author" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Dataset Loom</span>
                                    <span className="truncate text-xs">面向大模型的智能数据集构建工具</span>
                                </div>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={menuItems} projectId={projectId} />
                <NavDocuments />
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={(session?.user as CurrentUser) || user} />
            </SidebarFooter>
        </Sidebar>
    );
}
