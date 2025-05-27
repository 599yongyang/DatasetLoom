'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { CircleHelp } from 'lucide-react';
import * as React from 'react';
import { LanguageSwitch } from '@/components/language-switch';

export function SiteHeader() {
    return (
        <div className="sticky top-0 z-10">
            <header className="flex h-14 w-full shrink-0 items-center justify-between border-b bg-background/80 px-2 backdrop-blur-sm sm:h-16 sm:px-4">
                <div className="flex items-center gap-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <Image src="/logo.svg" width={200} height={200} alt="logo" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Dataset Loom</span>
                        <span className="truncate text-xs">面向大模型的智能数据集构建工具</span>
                    </div>
                </div>
                <div className="ml-auto flex flex-1 items-center justify-end space-x-2 px-2 sm:px-4 md:max-w-96 lg:max-w-lg">
                    <LanguageSwitch />
                    <Link href="https://github.com/599yongyang/DatasetLoom" target="_blank">
                        <Button variant="ghost" size="icon">
                            <Icons.gitHub className="size-5" />
                        </Button>
                    </Link>
                    <Link href="https://github.com/599yongyang/DatasetLoom" target="_blank">
                        <Button variant="ghost" size="icon">
                            <CircleHelp className="size-5" />
                        </Button>
                    </Link>
                </div>
            </header>
        </div>
    );
}
