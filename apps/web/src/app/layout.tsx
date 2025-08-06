import '@/styles/globals.css';

import {type Metadata} from 'next';
import {Toaster} from '@/components/ui/sonner';
import I18nProviderWrapper from '@/components/I18nProviderWrapper';
import HotkeysProviderWrapper from '@/components/HotkeysProviderWrapper';
import {ThemeProvider} from '@/components/theme/theme-provider';

export const metadata: Metadata = {
    title: 'Dataset Loom - 面向大模型的智能数据集构建工具',
    description: '面向大模型的智能数据集构建工具',
    icons: [{rel: 'icon', url: '/logo.ico'}]
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
        <I18nProviderWrapper>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <HotkeysProviderWrapper>{children}</HotkeysProviderWrapper>
                <Toaster richColors position={'top-center'}/>
            </ThemeProvider>
        </I18nProviderWrapper>
        </body>
        </html>
    );
}
