'use client';

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function NavDocuments() {
    const pathname = usePathname();
    const { t } = useTranslation('navigation');

    const { isPathActive } = useMemo(() => {
        const isPathActive = (path: string) => {
            return pathname === path || pathname.startsWith(`${path}/`);
        };
        return { isPathActive };
    }, [pathname]);
    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Documents</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild data-active={isPathActive('/dataset-square')}>
                        <Link href="/dataset-square">
                            <Store />
                            <span>{t('dataset_square')}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}
