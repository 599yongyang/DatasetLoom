import type { Config } from 'tailwindcss';

import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';

const config = {
    content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            animation: {
                aurora: 'aurora 60s linear infinite'
            },
            keyframes: {
                aurora: {
                    from: {
                        backgroundPosition: '50% 50%, 50% 50%'
                    },
                    to: {
                        backgroundPosition: '350% 50%, 350% 50%'
                    }
                }
            }
        }
    },
    plugins: [addVariablesForColors]
} satisfies Config;

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
    let allColors = flattenColorPalette(theme('colors'));
    let newVars = Object.fromEntries(Object.entries(allColors).map(([key, val]) => [`--${key}`, val]));

    addBase({
        ':root': newVars
    });
}

export default config;
