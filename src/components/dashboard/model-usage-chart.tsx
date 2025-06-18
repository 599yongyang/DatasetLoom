'use client';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent
} from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useGetModelUsageList } from '@/hooks/query/use-dashboard';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { selectedModelInfoAtom } from '@/atoms';
import { TrendingUp, Zap } from 'lucide-react';
import { ModelSelect } from '@/components/common/model-select';

type TimeRange = '3' | '7' | '15';

const chartConfig = {
    count: {
        label: 'API 调用次数'
    },
    promptTokens: {
        label: '输入 Tokens'
    },
    completionTokens: {
        label: '输出 Tokens'
    }
} satisfies ChartConfig;

const timeRangeOptions = [
    { value: '3', label: '3天' },
    { value: '7', label: '7天' },
    { value: '15', label: '15天' }
];

export function ModelUsagesChart() {
    const { projectId }: { projectId: string } = useParams();
    const [timeRange, setTimeRange] = useState<TimeRange>('7');
    const selectedModelConfig = useAtomValue(selectedModelInfoAtom);
    const [modelConfigId, setModelConfigId] = useState(selectedModelConfig.id);
    const { data: chartData } = useGetModelUsageList(projectId, modelConfigId, Number(timeRange));

    const handleTimeRangeChange = (value: TimeRange) => {
        setTimeRange(value);
    };

    return (
        <Card className="@container/card">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold">模型使用分析</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            最近 {timeRangeOptions.find(opt => opt.value === timeRange)?.label} 的使用情况
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        <ModelSelect value={modelConfigId} setValue={setModelConfigId} showConfigButton={false} />
                        <ToggleGroup
                            type="single"
                            value={timeRange}
                            onValueChange={handleTimeRangeChange}
                            variant="outline"
                            size="sm"
                            className="hidden @[600px]/card:flex"
                        >
                            {timeRangeOptions.map(option => (
                                <ToggleGroupItem key={option.value} value={option.value} className="text-xs px-3">
                                    {option.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>

                        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                            <SelectTrigger className="w-20 h-8 @[600px]/card:hidden" size="sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {timeRangeOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* API 调用次数图表 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950">
                                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-medium text-sm">API 调用次数</h3>
                                <p className="text-xs text-muted-foreground">每日调用统计</p>
                            </div>
                        </div>

                        <div className="h-[280px]">
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                                    <XAxis
                                        dataKey="monthDay"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11, fill: '#6b7280' }}
                                        width={40}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent indicator="line" />}
                                        cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                                    />
                                    <Area type="monotone" dataKey="count" strokeWidth={2} fill="url(#colorCount)" />
                                </AreaChart>
                            </ChartContainer>
                        </div>
                    </div>

                    {/* Tokens 使用情况图表 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950">
                                <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-medium text-sm">Tokens 使用情况</h3>
                                <p className="text-xs text-muted-foreground">输入输出统计</p>
                            </div>
                        </div>

                        <div className="h-[280px]">
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                    <XAxis dataKey="monthDay" tickLine={false} axisLine={false} />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6b7280' }} />

                                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                        wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                                    />
                                    <Bar dataKey="promptTokens" stackId="a" fill="#4f46e5" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="completionTokens" stackId="a" fill="#a855f7" radius={[0, 0, 2, 2]} />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
