'use client';

import { IconLoader2, IconBrain, IconAlertCircle } from '@tabler/icons-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetModelUseRank } from '@/hooks/query/use-dashboard';
import { useParams } from 'next/navigation';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useMemo } from 'react';
import { stringToColor } from '@/lib/utils';

interface ModelRankData {
    modeId: string;
    modelName: string;
    usageCount: number;
}

export function ModelUseRankChart() {
    const { projectId }: { projectId: string } = useParams();
    const { data: rankData, isLoading, isError } = useGetModelUseRank(projectId);

    const { chartConfig, processedData } = useMemo(() => {
        if (!rankData || rankData.length === 0) {
            return { chartConfig: {}, processedData: [] };
        }

        const config: ChartConfig = {
            usageCount: {
                label: '使用次数'
            }
        };

        const processed = rankData.map((item: ModelRankData, index: number) => ({
            ...item,
            fill: stringToColor(item.modelName),
            fillOpacity: 0.8 + index * 0.05
        }));

        return { chartConfig: config, processedData: processed };
    }, [rankData]);

    if (isError) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <IconAlertCircle className="w-5 h-5 text-destructive" />
                        <CardTitle className="text-lg">模型使用偏好</CardTitle>
                    </div>
                    <CardDescription>模型使用偏好统计</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                        <IconAlertCircle className="w-12 h-12 mb-4 text-destructive/50" />
                        <p className="text-lg font-medium mb-2">加载失败</p>
                        <p className="text-sm mb-4">无法获取模型使用数据</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="@container/chart">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <IconBrain className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">模型使用偏好</CardTitle>
                    </div>
                    {processedData.length > 0 && (
                        <div className="text-sm text-muted-foreground">共使用 {processedData.length} 个模型</div>
                    )}
                </div>
                <CardDescription>展示各模型的使用频次排名，帮助了解使用偏好</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center h-[300px]">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <IconLoader2 className="w-8 h-8 animate-spin text-primary" />
                            <div className="text-center">
                                <p className="font-medium">加载中...</p>
                                <p className="text-sm">正在获取模型使用数据</p>
                            </div>
                        </div>
                    </div>
                ) : processedData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                        <div className="text-center space-y-3">
                            <IconBrain className="w-16 h-16 mx-auto opacity-20" />
                            <div>
                                <p className="text-lg font-medium">暂无使用数据</p>
                                <p className="text-sm">请先添加模型并开始使用</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="h-[320px] @[500px]/chart:h-[280px] @[700px]/chart:h-[320px]">
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={processedData}
                                        layout="vertical"
                                        margin={{
                                            top: 10,
                                            right: 30,
                                            left: 10,
                                            bottom: 10
                                        }}
                                    >
                                        <XAxis
                                            type="number"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={value => value.toLocaleString()}
                                        />
                                        <YAxis
                                            dataKey="modelName"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12 }}
                                            width={100}
                                            tickFormatter={value => {
                                                return value.length > 12 ? `${value.slice(0, 12)}...` : value;
                                            }}
                                        />
                                        <ChartTooltip
                                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                            content={
                                                <ChartTooltipContent
                                                    hideLabel
                                                    formatter={(value, name, props) => [
                                                        `${value.toLocaleString()} 次`,
                                                        props.payload?.modelName || '模型'
                                                    ]}
                                                />
                                            }
                                        />
                                        <Bar dataKey="usageCount" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
