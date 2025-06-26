'use client';

import { IconDatabase, IconBrain, IconTarget } from '@tabler/icons-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';
import { useGetDatasetKanban } from '@/hooks/query/use-dashboard';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export function DatasetCards() {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('dashboard');
    const { data: kanbanData } = useGetDatasetKanban(projectId);
    return (
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <Card className="@container/card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10" />
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardDescription className="text-sm font-medium">{t('dataset_cards.all')}</CardDescription>
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950">
                            <IconDatabase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <CardTitle className="flex justify-between">
                        <div className={'text-2xl font-bold tabular-nums @[250px]/card:text-3xl'}>
                            {kanbanData?.allCount}
                        </div>
                        <div className={'text-sm font-medium pt-4'}>
                            <span>
                                {kanbanData?.confirmedCount > 0 && (
                                    <span>
                                        {t('dataset_cards.confirmed', {
                                            count: ((kanbanData?.confirmedCount / kanbanData?.allCount) * 100).toFixed(
                                                2
                                            )
                                        })}
                                    </span>
                                )}
                            </span>
                        </div>
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card className="@container/card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10" />
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardDescription className="text-sm font-medium">{t('dataset_cards.sft')}</CardDescription>
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950">
                            <IconBrain className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <CardTitle className="flex justify-between">
                        <div className={'text-2xl font-bold tabular-nums @[250px]/card:text-3xl'}>
                            {kanbanData?.sftCount}
                        </div>
                        <div className={'text-sm font-medium pt-4'}></div>
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card className="@container/card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10" />
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardDescription className="text-sm font-medium">{t('dataset_cards.dpo')}</CardDescription>
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950">
                            <IconTarget className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <CardTitle className="flex justify-between">
                        <div className={'text-2xl font-bold tabular-nums @[250px]/card:text-3xl'}>
                            {kanbanData?.dpoCount}
                        </div>
                        <div className={'text-sm font-medium pt-4'}></div>
                    </CardTitle>
                </CardHeader>
            </Card>
            <Card className="@container/card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-10 translate-x-10" />
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardDescription className="text-sm font-medium">{t('dataset_cards.cot')}</CardDescription>
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950">
                            <BrainCircuit className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
                        {kanbanData?.cotCount}
                    </CardTitle>
                </CardHeader>
            </Card>
        </div>
    );
}
