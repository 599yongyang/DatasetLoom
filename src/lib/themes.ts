import { themeColorsToCssVariables } from '@/lib/charts';

const _THEMES = [
    {
        name: 'Default',
        id: 'default-shadcn',
        colors: {
            background: '0 0% 100%',
            foreground: '240 10% 3.9%',
            card: '0 0% 100%',
            'card-foreground': '240 10% 3.9%',
            popover: '0 0% 100%',
            'popover-foreground': '240 10% 3.9%',
            primary: '240 5.9% 10%',
            'primary-foreground': '0 0% 98%',
            secondary: '240 4.8% 95.9%',
            'secondary-foreground': '240 5.9% 10%',
            muted: '240 4.8% 95.9%',
            'muted-foreground': '240 3.8% 46.1%',
            accent: '240 4.8% 95.9%',
            'accent-foreground': '240 5.9% 10%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '0 0% 98%',
            border: '240 5.9% 90%',
            input: '240 5.9% 90%',
            ring: '240 10% 3.9%',
            'chart-1': '173 58% 39%',
            'chart-2': '12 76% 61%',
            'chart-3': '197 37% 24%',
            'chart-4': '43 74% 66%',
            'chart-5': '27 87% 67%'
        },
        colorsDark: {
            background: '240 10% 3.9%',
            foreground: '0 0% 98%',
            card: '240 10% 3.9%',
            'card-foreground': '0 0% 98%',
            popover: '240 10% 3.9%',
            'popover-foreground': '0 0% 98%',
            primary: '0 0% 98%',
            'primary-foreground': '240 5.9% 10%',
            secondary: '240 3.7% 15.9%',
            'secondary-foreground': '0 0% 98%',
            muted: '240 3.7% 15.9%',
            'muted-foreground': '240 5% 64.9%',
            accent: '240 3.7% 15.9%',
            'accent-foreground': '0 0% 98%',
            destructive: '0 62.8% 30.6%',
            'destructive-foreground': '0 0% 98%',
            border: '240 3.7% 15.9%',
            input: '240 3.7% 15.9%',
            ring: '240 4.9% 83.9%',
            'chart-1': '220 70% 50%',
            'chart-5': '160 60% 45%',
            'chart-3': '30 80% 55%',
            'chart-4': '280 65% 60%',
            'chart-2': '340 75% 55%'
        },
        fontFamily: {
            heading: {
                name: 'Inter',
                type: 'sans-serif'
            },
            body: {
                name: 'Inter',
                type: 'sans-serif'
            }
        },
        radius: 0.5
    },
    {
        name: 'Palette',
        id: 'default-palette',
        colors: {
            background: '0 0% 100%',
            foreground: '240 10% 3.9%',
            card: '0 0% 100%',
            'card-foreground': '240 10% 3.9%',
            popover: '0 0% 100%',
            'popover-foreground': '240 10% 3.9%',
            primary: '240 5.9% 10%',
            'primary-foreground': '0 0% 98%',
            secondary: '240 4.8% 95.9%',
            'secondary-foreground': '240 5.9% 10%',
            muted: '240 4.8% 95.9%',
            'muted-foreground': '240 3.8% 46.1%',
            accent: '240 4.8% 95.9%',
            'accent-foreground': '240 5.9% 10%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '0 0% 98%',
            border: '240 5.9% 90%',
            input: '240 5.9% 90%',
            ring: '240 10% 3.9%',
            'chart-1': '12 76% 61%',
            'chart-2': '173 58% 39%',
            'chart-3': '197 37% 24%',
            'chart-4': '43 74% 66%',
            'chart-5': '27 87% 67%'
        },
        colorsDark: {
            background: '240 10% 3.9%',
            foreground: '0 0% 98%',
            card: '240 10% 3.9%',
            'card-foreground': '0 0% 98%',
            popover: '240 10% 3.9%',
            'popover-foreground': '0 0% 98%',
            primary: '0 0% 98%',
            'primary-foreground': '240 5.9% 10%',
            secondary: '240 3.7% 15.9%',
            'secondary-foreground': '0 0% 98%',
            muted: '240 3.7% 15.9%',
            'muted-foreground': '240 5% 64.9%',
            accent: '240 3.7% 15.9%',
            'accent-foreground': '0 0% 98%',
            destructive: '0 62.8% 30.6%',
            'destructive-foreground': '0 0% 98%',
            border: '240 3.7% 15.9%',
            input: '240 3.7% 15.9%',
            ring: '240 4.9% 83.9%',
            'chart-1': '220 70% 50%',
            'chart-2': '160 60% 45%',
            'chart-3': '30 80% 55%',
            'chart-4': '280 65% 60%',
            'chart-5': '340 75% 55%'
        },
        fontFamily: {
            heading: {
                name: 'Inter',
                type: 'sans-serif'
            },
            body: {
                name: 'Inter',
                type: 'sans-serif'
            }
        },
        radius: 0.5
    },
    {
        name: 'Sapphire',
        id: 'default-sapphire',
        colors: {
            background: '0 0% 100%',
            foreground: '222.2 84% 4.9%',
            card: '0 0% 100%',
            cardForeground: '222.2 84% 4.9%',
            popover: '0 0% 100%',
            popoverForeground: '222.2 84% 4.9%',
            primary: '221.2 83.2% 53.3%',
            primaryForeground: '210 40% 98%',
            secondary: '210 40% 96.1%',
            secondaryForeground: '222.2 47.4% 11.2%',
            muted: '210 40% 96.1%',
            mutedForeground: '215.4 16.3% 44%',
            accent: '210 40% 96.1%',
            accentForeground: '222.2 47.4% 11.2%',
            destructive: '0 72% 51%',
            destructiveForeground: '210 40% 98%',
            border: '214.3 31.8% 91.4%',
            input: '214.3 31.8% 91.4%',
            ring: '221.2 83.2% 53.3%',
            'chart-1': '221.2 83.2% 53.3%',
            'chart-2': '212 95% 68%',
            'chart-3': '216 92% 60%',
            'chart-4': '210 98% 78%',
            'chart-5': '212 97% 87%'
        },
        colorsDark: {
            background: '240 10% 3.9%',
            foreground: '0 0% 98%',
            card: '240 10% 3.9%',
            'card-foreground': '0 0% 98%',
            popover: '240 10% 3.9%',
            'popover-foreground': '0 0% 98%',
            primary: '221.2 83.2% 53.3%',
            primaryForeground: '210 40% 98%',
            secondary: '210 40% 96.1%',
            secondaryForeground: '222.2 47.4% 11.2%',
            muted: '240 3.7% 15.9%',
            'muted-foreground': '240 5% 64.9%',
            accent: '240 3.7% 15.9%',
            'accent-foreground': '0 0% 98%',
            destructive: '0 72% 51%',
            destructiveForeground: '210 40% 98%',
            border: '240 3.7% 15.9%',
            input: '240 3.7% 15.9%',
            ring: '221.2 83.2% 53.3%',
            'chart-1': '221.2 83.2% 53.3%',
            'chart-2': '212 95% 68%',
            'chart-3': '216 92% 60%',
            'chart-4': '210 98% 78%',
            'chart-5': '212 97% 87%'
        },
        fontFamily: {
            heading: {
                name: 'Inter',
                type: 'sans-serif'
            },
            body: {
                name: 'Inter',
                type: 'sans-serif'
            }
        },
        radius: 0.5
    },
    {
        name: 'Ruby',
        id: 'default-ruby',
        colors: {
            background: '0 0% 100%',
            foreground: '240 10% 3.9%',
            card: '0 0% 100%',
            cardForeground: '240 10% 3.9%',
            popover: '0 0% 100%',
            popoverForeground: '240 10% 3.9%',
            primary: '346.8 77.2% 49.8%',
            primaryForeground: '355.7 100% 99%',
            secondary: '240 4.8% 95.9%',
            secondaryForeground: '240 5.9% 10%',
            muted: '240 4.8% 95.9%',
            mutedForeground: '240 3.8% 45%',
            accent: '240 4.8% 95.9%',
            accentForeground: '240 5.9% 10%',
            destructive: '0 72% 51%',
            destructiveForeground: '0 0% 98%',
            border: '240 5.9% 90%',
            input: '240 5.9% 90%',
            ring: '346.8 77.2% 49.8%',
            'chart-1': '347 77% 50%',
            'chart-2': '352 83% 91%',
            'chart-3': '350 80% 72%',
            'chart-4': '351 83% 82%',
            'chart-5': '349 77% 62%'
        },
        colorsDark: {
            background: '240 10% 3.9%',
            foreground: '0 0% 98%',
            card: '240 10% 3.9%',
            'card-foreground': '0 0% 98%',
            popover: '240 10% 3.9%',
            'popover-foreground': '0 0% 98%',
            primary: '346.8 77.2% 49.8%',
            primaryForeground: '355.7 100% 99%',
            secondary: '240 4.8% 95.9%',
            secondaryForeground: '240 5.9% 10%',
            muted: '240 3.7% 15.9%',
            'muted-foreground': '240 5% 64.9%',
            accent: '240 3.7% 15.9%',
            'accent-foreground': '0 0% 98%',
            destructive: '0 72% 51%',
            destructiveForeground: '0 0% 98%',
            border: '240 3.7% 15.9%',
            input: '240 3.7% 15.9%',
            ring: '221.2 83.2% 53.3%',
            'chart-1': '347 77% 50%',
            'chart-2': '349 77% 62%',
            'chart-3': '350 80% 72%',
            'chart-4': '351 83% 82%',
            'chart-5': '352 83% 91%'
        },
        fontFamily: {
            heading: {
                name: 'Inter',
                type: 'sans-serif'
            },
            body: {
                name: 'Inter',
                type: 'sans-serif'
            }
        },
        radius: 0.5
    },
    {
        name: 'Emerald',
        id: 'default-emerald',
        colors: {
            background: '0 0% 100%',
            foreground: '240 10% 3.9%',
            card: '0 0% 100%',
            cardForeground: '240 10% 3.9%',
            popover: '0 0% 100%',
            popoverForeground: '240 10% 3.9%',
            primary: '142 86% 28%',
            primaryForeground: '356 29% 98%',
            secondary: '240 4.8% 95.9%',
            secondaryForeground: '240 5.9% 10%',
            muted: '240 4.8% 95.9%',
            mutedForeground: '240 3.8% 45%',
            accent: '240 4.8% 95.9%',
            accentForeground: '240 5.9% 10%',
            destructive: '0 72% 51%',
            destructiveForeground: '0 0% 98%',
            border: '240 5.9% 90%',
            input: '240 5.9% 90%',
            ring: '142 86% 28%',
            'chart-1': '139 65% 20%',
            'chart-2': '140 74% 44%',
            'chart-3': '142 88% 28%',
            'chart-4': '137 55% 15%',
            'chart-5': '141 40% 9%'
        },
        colorsDark: {
            background: '240 10% 3.9%',
            foreground: '0 0% 98%',
            card: '240 10% 3.9%',
            'card-foreground': '0 0% 98%',
            popover: '240 10% 3.9%',
            'popover-foreground': '0 0% 98%',
            primary: '142 86% 28%',
            primaryForeground: '356 29% 98%',
            secondary: '240 4.8% 95.9%',
            secondaryForeground: '240 5.9% 10%',
            muted: '240 3.7% 15.9%',
            'muted-foreground': '240 5% 64.9%',
            accent: '240 3.7% 15.9%',
            'accent-foreground': '0 0% 98%',
            destructive: '0 72% 51%',
            destructiveForeground: '0 0% 98%',
            border: '240 3.7% 15.9%',
            input: '240 3.7% 15.9%',
            ring: '142 86% 28%',
            'chart-1': '142 88% 28%',
            'chart-2': '139 65% 20%',
            'chart-3': '140 74% 24%',
            'chart-4': '137 55% 15%',
            'chart-5': '141 40% 9%'
        },
        fontFamily: {
            heading: {
                name: 'Inter',
                type: 'sans-serif'
            },
            body: {
                name: 'Inter',
                type: 'sans-serif'
            }
        },
        radius: 0.5
    },
    {
        name: 'Daylight',
        id: 'default-daylight',
        colors: {
            background: '36 39% 88%',
            foreground: '36 45% 15%',
            primary: '36 45% 70%',
            primaryForeground: '36 45% 11%',
            secondary: '40 35% 77%',
            secondaryForeground: '36 45% 25%',
            accent: '36 64% 57%',
            accentForeground: '36 72% 17%',
            destructive: '0 84% 37%',
            destructiveForeground: '0 0% 98%',
            muted: '36 33% 75%',
            mutedForeground: '36 45% 25%',
            card: '36 46% 82%',
            cardForeground: '36 45% 20%',
            popover: '0 0% 100%',
            popoverForeground: '240 10% 3.9%',
            border: '36 45% 60%',
            input: '36 45% 60%',
            ring: '36 45% 30%',
            'chart-1': '25 34% 28%',
            'chart-2': '26 36% 34%',
            'chart-3': '28 40% 40%',
            'chart-4': '31 41% 48%',
            'chart-5': '35 43% 53%'
        },
        colorsDark: {
            background: '36 39% 88%',
            foreground: '36 45% 15%',
            primary: '36 45% 70%',
            primaryForeground: '36 45% 11%',
            secondary: '40 35% 77%',
            secondaryForeground: '36 45% 25%',
            accent: '36 64% 57%',
            accentForeground: '36 72% 17%',
            destructive: '0 84% 37%',
            destructiveForeground: '0 0% 98%',
            muted: '36 33% 75%',
            mutedForeground: '36 45% 25%',
            card: '36 46% 82%',
            cardForeground: '36 45% 20%',
            popover: '0 0% 100%',
            popoverForeground: '240 10% 3.9%',
            border: '36 45% 60%',
            input: '36 45% 60%',
            ring: '36 45% 30%',
            'chart-1': '25 34% 28%',
            'chart-2': '26 36% 34%',
            'chart-3': '28 40% 40%',
            'chart-4': '31 41% 48%',
            'chart-5': '35 43% 53%'
        },
        fontFamily: {
            heading: {
                name: 'DM Sans',
                type: 'sans-serif'
            },
            body: {
                name: 'Space Mono',
                type: 'monospace'
            }
        }
    },
    {
        name: 'Midnight',
        id: 'default-midnight',
        colors: {
            background: '240 5% 6%',
            foreground: '60 5% 90%',
            primary: '240 0% 90%',
            primaryForeground: '60 0% 0%',
            secondary: '240 4% 15%',
            secondaryForeground: '60 5% 85%',
            accent: '240 0% 13%',
            accentForeground: '60 0% 100%',
            destructive: '0 60% 50%',
            destructiveForeground: '0 0% 98%',
            muted: '240 5% 25%',
            mutedForeground: '60 5% 85%',
            card: '240 4% 10%',
            cardForeground: '60 5% 90%',
            popover: '240 5% 15%',
            popoverForeground: '60 5% 85%',
            border: '240 6% 20%',
            input: '240 6% 20%',
            ring: '240 5% 90%',
            'chart-1': '359 2% 90%',
            'chart-2': '240 1% 74%',
            'chart-3': '240 1% 58%',
            'chart-4': '240 1% 42%',
            'chart-5': '240 2% 26%'
        },
        colorsDark: {
            background: '240 5% 6%',
            foreground: '60 5% 90%',
            primary: '240 0% 90%',
            primaryForeground: '60 0% 0%',
            secondary: '240 4% 15%',
            secondaryForeground: '60 5% 85%',
            accent: '240 0% 13%',
            accentForeground: '60 0% 100%',
            destructive: '0 60% 50%',
            destructiveForeground: '0 0% 98%',
            muted: '240 5% 25%',
            mutedForeground: '60 5% 85%',
            card: '240 4% 10%',
            cardForeground: '60 5% 90%',
            popover: '240 5% 15%',
            popoverForeground: '60 5% 85%',
            border: '240 6% 20%',
            input: '240 6% 20%',
            ring: '240 5% 90%',
            'chart-1': '359 2% 90%',
            'chart-2': '240 1% 74%',
            'chart-3': '240 1% 58%',
            'chart-4': '240 1% 42%',
            'chart-5': '240 2% 26%'
        },
        fontFamily: {
            heading: {
                name: 'Manrope',
                type: 'sans-serif'
            },
            body: {
                name: 'Manrope',
                type: 'sans-serif'
            }
        },
        radius: 0.5
    }
] as const;

export const THEMES = _THEMES.map(theme => ({
    ...theme,
    cssVars: {
        light: themeColorsToCssVariables(theme.colors),
        dark: themeColorsToCssVariables(theme.colorsDark)
    }
}));

export type Theme = (typeof THEMES)[number];
