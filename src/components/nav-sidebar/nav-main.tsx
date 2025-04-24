'use client';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem
} from '@/components/ui/sidebar';
import { useAtom } from 'jotai';
import { ChevronRight, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { navOpenItemsAtom } from '@/atoms';
import type { IMenu } from '@/schema/menu';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ProjectSelect } from '@/components/project/project-select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { ProjectDialog } from '@/components/project/project-dialog';

export function NavMain({ items }: { items: IMenu[] }) {
    const { t } = useTranslation('navigation');
    const pathname = usePathname();
    const [openItems, setOpenItems] = useAtom(navOpenItemsAtom);
    const [open, setOpen] = useState(false);

    const { isPathActive, isParentActive } = useMemo(() => {
        const isPathActive = (path: string) => {
            return pathname === path || pathname.startsWith(`${path}/`);
        };

        const isParentActive = (item: IMenu) => {
            return item.children?.some(child => isPathActive(child.to));
        };

        return { isPathActive, isParentActive };
    }, [pathname]);

    useEffect(() => {
        const newOpenItems: Record<string, boolean> = { ...openItems };
        let hasChanges = false;

        items.forEach(item => {
            const shouldBeOpen = isPathActive(item.to) || isParentActive(item);
            if (shouldBeOpen && !newOpenItems[item.title]) {
                newOpenItems[item.title] = true;
                hasChanges = true;
            }
        });

        if (hasChanges) {
            setOpenItems(newOpenItems);
        }
    }, [pathname, items, isPathActive, isParentActive]);

    const handleToggle = (title: string) => {
        setOpenItems(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const handleToggleAll = () => {
        const allExpanded = items.every(item => openItems[item.title]);
        const newOpenItems: Record<string, boolean> = {};

        items.forEach(item => {
            newOpenItems[item.title] = !allExpanded;
        });

        setOpenItems(newOpenItems);
    };
    return (
        <>
            <SidebarGroup className="flex flex-col gap-2">
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2">
                        <ProjectSelect />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        onClick={() => setOpen(true)}
                                        className="h-9 w-9 shrink-0 hover:cursor-pointer group-data-[collapsible=icon]:opacity-0"
                                    >
                                        <Plus />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('quick_create')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    {items.map(item => (
                        <Collapsible
                            key={item.title}
                            asChild
                            open={openItems[item.title]}
                            onOpenChange={() => handleToggle(item.title)}
                        >
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={t(item.title)}
                                    data-active={item.children ? false : isPathActive(item.to)}
                                >
                                    <Link href={item.to}>
                                        <item.icon />
                                        <span>{t(item.title)}</span>
                                    </Link>
                                </SidebarMenuButton>
                                {item.children?.length ? (
                                    <>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuAction className="data-[state=open]:rotate-90">
                                                <ChevronRight />
                                                <span className="sr-only">Toggle</span>
                                            </SidebarMenuAction>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.children?.map(subItem => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            data-active={isPathActive(subItem.to)}
                                                        >
                                                            <Link href={subItem.to}>
                                                                <span>{t(subItem.title)}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </>
                                ) : null}
                            </SidebarMenuItem>
                        </Collapsible>
                    ))}
                </SidebarMenu>
            </SidebarGroup>
            <ProjectDialog open={open} onOpenChange={setOpen} />
        </>
    );
}
