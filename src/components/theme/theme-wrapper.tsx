'use client';
import { useConfig } from '@/hooks/use-config';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ThemesStyle } from '@/components/theme/themes-styles';

interface ThemeWrapperProps extends React.ComponentProps<'div'> {
    defaultTheme?: string;
}

export function ThemeWrapper({ defaultTheme, children, className }: ThemeWrapperProps) {
    const [config] = useConfig();

    return (
        <div
            className={cn(`theme-${defaultTheme || config.theme}`, 'w-full', className)}
            style={
                {
                    '--radius': `${defaultTheme ? 0.5 : config.radius}rem`
                } as React.CSSProperties
            }
        >
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                {children}
                <ThemesStyle />
            </ThemeProvider>
        </div>
    );
}
