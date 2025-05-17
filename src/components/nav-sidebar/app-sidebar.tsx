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
import Link from 'next/link';
import { getMenuConfig } from '@/constants/menus';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { NavDocuments } from '@/components/nav-sidebar/nav-documents';
import { useAtomValue } from 'jotai';
import { selectedProjectAtom } from '@/atoms';

const navSecondary = [
    {
        title: 'Feedback',
        url: 'https://github.com/599yongyang/DatasetLoom/issues',
        icon: Send,
        external: true
    }
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    let { projectId }: { projectId: string } = useParams();
    if (!projectId) {
        projectId = useAtomValue(selectedProjectAtom);
    }

    const menuItems = getMenuConfig(projectId);
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Image src="/logo.svg" width={200} height={200} alt="Picture of the author" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Dataset Loom</span>
                                    <span className="truncate text-xs">一款高效的大型语言模型数据构建工具</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={menuItems} />
                <NavDocuments />
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter></SidebarFooter>
        </Sidebar>
    );
}
