'use client';

import { IconTags, IconLoader2 } from '@tabler/icons-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetDomain } from '@/hooks/query/use-dashboard';
import { useParams } from 'next/navigation';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { ChartTooltip } from '@/components/ui/chart';
import { stringToColor } from '@/lib/utils';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

export function DomainChart() {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('dashboard');
    const [checked, setChecked] = useState<boolean>(true);
    const { data: domainData, isLoading, isError } = useGetDomain(projectId, checked ? 1 : 2);

    return (
        <Card className="@container/chart">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <IconTags className="w-5 h-5 text-blue-600" />
                        <CardTitle className="text-lg">{t('domain_chart.title')}</CardTitle>
                    </div>

                    <div className="text-right">
                        <div className="inline-flex items-center gap-2">
                            <Switch checked={checked} onCheckedChange={setChecked} />
                            <Label className="text-sm font-medium">
                                {checked ? t('domain_chart.level1') : t('domain_chart.level2')}
                            </Label>
                        </div>
                    </div>
                </div>
                <CardDescription>{t('domain_chart.desc')}</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center h-[300px]">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <IconLoader2 className="w-4 h-4 animate-spin" />
                            <span>${t('loading')}</span>
                        </div>
                    </div>
                ) : domainData?.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <div className="text-center">
                            <IconTags className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>{t('domain_chart.nodata')}</p>
                            <p className="text-sm">{t('domain_chart.nodata_desc')}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="h-[280px] @[400px]/chart:h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={domainData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={110}
                                        paddingAngle={2}
                                        dataKey="count"
                                        animationBegin={0}
                                        animationDuration={800}
                                    >
                                        {domainData?.map((item, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={stringToColor(item.domain)}
                                                stroke="white"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <ChartTooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0]?.payload;
                                                return (
                                                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{
                                                                        backgroundColor: stringToColor(data.domain)
                                                                    }}
                                                                />
                                                                <span className="font-semibold">{data.domain}</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-muted-foreground">
                                                                        {t('domain_chart.count')}
                                                                    </span>
                                                                    <div className="font-bold">{data.count}</div>
                                                                </div>
                                                                <div>
                                                                    <span className="text-muted-foreground">
                                                                        {t('domain_chart.percent')}
                                                                    </span>
                                                                    <div className="font-bold">{data.value}%</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* 图例 */}
                        <div className="mt-3 max-h-[200px] overflow-y-auto">
                            <div className="grid grid-cols-1 @[500px]:grid-cols-4 @[800px]:grid-cols-3 gap-2">
                                {domainData?.map(item => (
                                    <div
                                        key={item.domain}
                                        className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/20"
                                    >
                                        <div
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: stringToColor(item.domain) }}
                                        />
                                        <span className="text-xs truncate flex-1">{item.domain}</span>
                                        <div className="text-xs font-medium">{item.value}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
