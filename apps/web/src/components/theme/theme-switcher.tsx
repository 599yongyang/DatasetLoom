'use client';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Moon, Sun } from 'lucide-react';

import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';

export function ThemeSwitcher() {
    const { setTheme } = useTheme();
    const { t } = useTranslation('common');
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>{t('themes.light')}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>{t('themes.dark')}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>{t('themes.system')}</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
