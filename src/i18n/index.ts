import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import common from './locales/en/common.json';
import navigation from './locales/en/navigation.json';
import project from './locales/en/project.json';
import dashboard from './locales/en/dashboard.json';
import question from './locales/en/question.json';
import dataset from './locales/en/dataset.json';
import document from './locales/en/document.json';
import chunk from './locales/en/chunk.json';

import commonZh from './locales/zh-CN/common.json';
import navigationZh from './locales/zh-CN/navigation.json';
import projectZh from './locales/zh-CN/project.json';
import dashboardZh from './locales/zh-CN/dashboard.json';
import questionZh from './locales/zh-CN/question.json';
import datasetZh from './locales/zh-CN/dataset.json';
import documentZh from './locales/zh-CN/document.json';
import chunkZh from './locales/zh-CN/chunk.json';

const enResources = {
    common,
    navigation,
    project,
    dashboard,
    question,
    dataset,
    document,
    chunk
};
const zhResources = {
    common: commonZh,
    navigation: navigationZh,
    project: projectZh,
    dashboard: dashboardZh,
    question: questionZh,
    dataset: datasetZh,
    document: documentZh,
    chunk: chunkZh
};

const resources = {
    en: enResources,
    zh: zhResources
};

export const languages = [
    {
        value: 'en',
        label: 'English',
        icon: '🇬🇧'
    },
    {
        value: 'zh',
        label: '中文',
        icon: '🇨🇳'
    }
] as const;

export const ns = ['common', 'navigation', 'project', 'dashboard', 'question', 'dataset', 'document', 'chunk'] as const;

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'zh',
        defaultNS: 'common',
        ns,
        debug: true,
        interpolation: {
            escapeValue: false
        }
    });

export { default as i18n } from 'i18next';
