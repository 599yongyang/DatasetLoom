import 'i18next';

import type { resources } from '@/i18n';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        resources: {
            common: typeof resources.zh.common;
            navigation: typeof resources.zh.navigation;
            project: typeof resources.zh.project;
            question: typeof resources.zh.question;
            dataset: typeof resources.zh.dataset;
            document: typeof resources.zh.document;
        };
    }
}
