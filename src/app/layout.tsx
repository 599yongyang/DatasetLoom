import '@/styles/globals.css';

import { type Metadata } from 'next';
import { ThemeWrapper } from '@/components/theme/theme-wrapper';
import { Toaster } from '@/components/ui/sonner';
import I18nProviderWrapper from '@/components/I18nProviderWrapper';
import HotkeysProviderWrapper from '@/components/HotkeysProviderWrapper';

export const metadata: Metadata = {
    title: 'Easy Dataset',
    description: '一个强大的 LLM 数据集生成工具',
    icons: [{ rel: 'icon', url: '/logo.ico' }]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <I18nProviderWrapper>
                    <ThemeWrapper>
                        <HotkeysProviderWrapper>{children}</HotkeysProviderWrapper>
                        <Toaster richColors position={'top-center'} />
                    </ThemeWrapper>
                </I18nProviderWrapper>
            </body>
        </html>
    );
}
