'use client';

import { ChevronsUpDown, LogOut, RotateCcwKey, Sparkles } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import type { CurrentUser } from '@/server/auth';
import { UserProfile } from '@/components/user/user-profile';
import { useState } from 'react';
import { EditPassword } from '@/components/user/edit-password';

export function NavUser({ user }: { user: CurrentUser }) {
    const { isMobile } = useSidebar();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar ?? ''} alt={user.name!} />
                                    <AvatarFallback className="rounded-lg">
                                        {user.name?.slice(0, 1).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            side={isMobile ? 'bottom' : 'right'}
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuItem
                                className="p-0 font-normal"
                                onClick={() => {
                                    setOpen(true);
                                }}
                            >
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user.avatar ?? ''} alt={user.name!} />
                                        <AvatarFallback className="rounded-lg">
                                            {user.name?.slice(0, 1).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{user.name}</span>
                                        <span className="truncate text-xs">{user.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    setPasswordOpen(true);
                                }}
                            >
                                <RotateCcwKey />
                                修改密码
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onClick={() => {
                                        router.push('/');
                                    }}
                                >
                                    <Sparkles />
                                    我的项目
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    signOut({
                                        redirectTo: '/login'
                                    });
                                }}
                            >
                                <LogOut />登 出
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
            <UserProfile open={open} setOpen={setOpen} />
            <EditPassword open={passwordOpen} setOpen={setPasswordOpen} />
        </>
    );
}
