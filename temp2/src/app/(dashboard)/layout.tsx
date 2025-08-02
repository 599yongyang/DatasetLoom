import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/nav-sidebar/app-sidebar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CircleHelp } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { NavBreadcrumb } from '@/components/nav-sidebar/nav-breadcrumb';
import { Search } from '@/components/search';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import { auth, type CurrentUser } from '@/server/auth';
import { redirect } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { NavModelSelect } from '@/components/nav-sidebar/nav-model-select';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session) {
        redirect('/login');
    }
    return (
        <SessionProvider basePath="/api/auth">
            <SidebarProvider>
                <AppSidebar user={session.user as CurrentUser} />
                <SidebarInset className="w-full overflow-hidden">
                    <div className="sticky top-0 z-10">
                        <header className="flex h-14 w-full shrink-0 items-center justify-between border-b bg-background/80 px-2 backdrop-blur-sm sm:h-16 sm:px-4">
                            <div className="flex items-center gap-2">
                                <SidebarTrigger className="-ml-0.5 sm:-ml-1" />
                                <Separator orientation="vertical" className="mr-2 hidden h-4 sm:block" />
                                <NavBreadcrumb className="hidden sm:flex" user={session.user as CurrentUser} />
                            </div>
                            <div className="ml-auto flex flex-1 items-center justify-end space-x-2 px-2 sm:px-4 md:max-w-100 lg:max-w-3xl">
                                <NavModelSelect />
                                <Search />
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
                                <ThemeSwitcher />
                            </div>
                        </header>
                    </div>

                    <ScrollArea className="flex h-[calc(100vh-5rem)] flex-col gap-2 p-2 pt-0 sm:h-[calc(100vh-5rem)] sm:p-2">
                        <div className="p-1 sm:py-2">{children}</div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </SidebarInset>
            </SidebarProvider>
        </SessionProvider>
    );
}
