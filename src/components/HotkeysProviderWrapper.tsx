'use client';

import { HotkeysProvider } from 'react-hotkeys-hook';

export default function HotkeysProviderWrapper({ children }: { children: React.ReactNode }) {
    return <HotkeysProvider initiallyActiveScopes={['home']}>{children}</HotkeysProvider>;
}
