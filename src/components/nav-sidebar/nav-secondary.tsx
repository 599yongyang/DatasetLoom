import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';
import type { LucideIcon } from 'lucide-react';
import * as React from 'react';
import Link from 'next/link';

export function NavSecondary({
    items,
    ...props
}: {
    items: {
        title: I18nKeys;
        url: string;
        icon: LucideIcon;
        external?: boolean;
    }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map(item => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild size="sm">
                                <Link href={item.url} target={item.external ? '_blank' : '_self'}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
