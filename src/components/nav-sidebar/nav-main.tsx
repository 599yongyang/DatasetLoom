'use client';
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
import { usePathname, useRouter } from 'next/navigation';
import { ProjectSelect } from '@/components/project/project-select';
import { toast } from 'sonner';

export function NavMain({ items, projectId }: { items: IMenu[]; projectId: string }) {
    const { t } = useTranslation('navigation');
    const pathname = usePathname();
    const [openItems, setOpenItems] = useAtom(navOpenItemsAtom);
    const [open, setOpen] = useState(false);
    const router = useRouter();
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
    const handleClick = (href: string) => {
        if (projectId) {
            router.push(href);
        } else {
            toast.warning('Please select a project');
        }
    };
    return (
        <>
            <SidebarGroup className="flex flex-col gap-2">
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2">
                        <ProjectSelect />
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    {items.map(item => (
                        <Collapsible
                            key={item.title}
                            asChild
                            // open={openItems[item.title]}
                            open={true}
                            onOpenChange={() => handleToggle(item.title)}
                        >
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={t(item.title)}
                                    data-active={item.children ? false : isPathActive(item.to)}
                                >
                                    <div className={'hover:cursor-pointer'} onClick={() => handleClick(item.to)}>
                                        <item.icon />
                                        <span>{t(item.title)}</span>
                                    </div>
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
                                                            <div
                                                                className={'hover:cursor-pointer'}
                                                                onClick={() => handleClick(item.to)}
                                                            >
                                                                <span>{t(subItem.title)}</span>
                                                            </div>
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
        </>
    );
}
