'use client';
import { LaptopIcon, MoonIcon, SunIcon } from '@radix-ui/react-icons';
import type { ButtonProps } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from '@/components/ui/command';
import type { DialogProps } from '@/components/ui/dialog';
import { CircleHelp, SearchIcon } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

import { languages } from '@/i18n';
import { cn } from '@/lib/utils';

import { Icons } from './icons';
import { useTheme } from 'next-themes';

export function Search({ ...props }: ButtonProps & DialogProps) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const { setTheme } = useTheme();

    const { i18n, t } = useTranslation('common');

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
                if (
                    (e.target instanceof HTMLElement && e.target.isContentEditable) ||
                    e.target instanceof HTMLInputElement ||
                    e.target instanceof HTMLTextAreaElement ||
                    e.target instanceof HTMLSelectElement
                ) {
                    return;
                }

                e.preventDefault();
                setOpen(open => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            <Button
                variant="outline"
                className={cn(
                    'relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:w-64 md:w-80 lg:w-96',
                    'transition-all duration-200',
                    'hover:bg-muted/80'
                )}
                onClick={() => setOpen(true)}
                {...props}
            >
                <div className="inline-flex items-center gap-2 capitalize">
                    <SearchIcon className="size-4" />
                    <span className="sm:inline-flex">{t('search')}...</span>
                </div>
                <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Language">
                        {languages.map(language => (
                            <CommandItem
                                key={language.value}
                                value={language.value}
                                onSelect={() => runCommand(() => changeLanguage(language.value))}
                            >
                                {language.icon} {language.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Theme">
                        <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
                            <SunIcon className="mr-2 size-4" />
                            {t('themes.light')}
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
                            <MoonIcon className="mr-2 size-4" />
                            {t('themes.dark')}
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
                            <LaptopIcon className="mr-2 size-4" />
                            {t('themes.system')}
                        </CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Links">
                        <CommandItem
                            value={''}
                            onSelect={() => {
                                runCommand(() => router.push('/'));
                            }}
                        >
                            <Icons.gitHub className="mr-2 size-4" />
                            GitHub
                        </CommandItem>
                        <CommandItem
                            value=""
                            onSelect={() => {
                                runCommand(() => router.push('/'));
                            }}
                        >
                            <CircleHelp className="mr-2 size-4" />
                            Document
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
