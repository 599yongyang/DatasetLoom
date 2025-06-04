import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
    Tooltip
} from 'recharts';
import type { DatasetSamples } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Atom } from 'lucide-react';

export const AIScoreDashboard = ({ dss, handleAIScore }: { dss: DatasetSamples; handleAIScore: () => void }) => {
    // 处理0分和空值情况
    const getSafeScore = (value: number | null) => {
        if (value === null || isNaN(value)) return 0;
        return Math.max(0, Math.min(1, value));
    };

    const modelEvaluationData = [
        {
            dimension: '事实准确性',
            score: getSafeScore(dss.factualAccuracyScore),
            diagnosis: dss.factualInfo || '无诊断信息'
        },
        {
            dimension: '逻辑完备性',
            score: getSafeScore(dss.logicalIntegrityScore),
            diagnosis: dss.logicalInfo || '无诊断信息'
        },
        {
            dimension: '表达质量',
            score: getSafeScore(dss.expressionQualityScore),
            diagnosis: dss.expressionInfo || '无诊断信息'
        },
        {
            dimension: '安全合规',
            score: getSafeScore(dss.safetyComplianceScore),
            diagnosis: dss.safetyInfo || '无诊断信息'
        },
        {
            dimension: '综合得分',
            score: getSafeScore(dss.compositeScore),
            diagnosis: dss.compositeInfo || '无诊断信息'
        }
    ];

    // 计算总体评级
    const getOverallRating = () => {
        const composite = getSafeScore(dss.compositeScore);
        if (composite >= 0.8) return { text: '优秀', color: 'text-green-500' };
        if (composite >= 0.6) return { text: '良好', color: 'text-yellow-500' };
        return { text: '需改进', color: 'text-red-500' };
    };

    const overallRating = getOverallRating();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-primary">大模型回答质量评估</h1>
                <p className="text-muted-foreground mt-2">
                    基于多维度评分的能力雷达图分析 - Model: {dss.aiScoreModel || '未知模型'}
                </p>
            </div>
            {/* 按钮区域 */}
            <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={handleAIScore} className="gap-1">
                    <Atom className="w-4 h-4" />
                    重新生成 AI 评分
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <ModelRadarChart modelData={modelEvaluationData} />
                </div>

                <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg text-primary">评分详情</h3>
                        <div className={`px-3 py-1 rounded-full ${overallRating.color} bg-opacity-20`}>
                            <span className="text-sm font-medium">整体评级: {overallRating.text}</span>
                        </div>
                    </div>

                    <div className="space-y-4 overflow-y-auto flex-grow pr-2">
                        {modelEvaluationData.map((item, index) => {
                            const scorePercent = item.score * 100;
                            const barColor =
                                scorePercent >= 80
                                    ? 'bg-green-500'
                                    : scorePercent >= 60
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500';
                            const barWidth = Math.max(5, scorePercent); // 确保至少显示5%宽度

                            return (
                                <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">{item.dimension}</span>
                                        <span className="font-bold text-primary">{scorePercent.toFixed(1)}%</span>
                                    </div>
                                    <div className="mt-1">
                                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${barColor}`}
                                                style={{ width: `${barWidth}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 break-words">{item.diagnosis}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-sm mb-2 text-primary">评估结论</h4>
                        <p className="text-sm text-muted-foreground">{dss.compositeInfo || '无评估结论'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ModelRadarChart = ({ modelData }: { modelData: any }) => {
    const shadcnColors = {
        primary: 'hsl(222.2, 47.4%, 11.2%)',
        secondary: 'hsl(210, 40%, 96.1%)',
        accent: 'hsl(217.2, 91.2%, 59.8%)',
        muted: 'hsl(210, 40%, 96.1%)',
        border: 'hsl(214.3, 31.8%, 91.4%)',
        card: 'hsl(0, 0%, 100%)'
    };

    // 确保数据有效，处理0分情况
    const safeModelData = modelData.map((item: any) => ({
        ...item,
        score: isNaN(item.score) || item.score === null ? 0 : Math.max(0, Math.min(1, item.score))
    }));

    // 自定义工具提示 - 增强0分显示
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const score = payload[0].value;
            const scoreColor = score < 0.6 ? 'text-red-500' : score < 0.8 ? 'text-yellow-500' : 'text-green-500';

            return (
                <div className="bg-card p-3 border rounded-md shadow-lg min-w-[180px]">
                    <p className="font-medium text-primary">{payload[0].payload.dimension}</p>
                    <p className={`text-sm font-semibold ${scoreColor}`}>
                        {`${(score * 100).toFixed(1)}%`}
                        {score === 0 && <span className="text-xs text-red-500 ml-2">(严重问题)</span>}
                    </p>
                    {payload[0].payload.diagnosis && (
                        <p className="text-xs mt-1 text-secondary-foreground">{payload[0].payload.diagnosis}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[500px] bg-card border rounded-xl p-4 shadow-sm">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-primary">回答质量雷达图</h3>
                <p className="text-sm text-muted-foreground">多维度评估模型回答质量</p>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={safeModelData}
                    margin={{ top: 10, right: 30, bottom: 20, left: 30 }}
                >
                    <PolarGrid stroke={shadcnColors.border} strokeDasharray="3 3" />
                    <PolarAngleAxis
                        dataKey="dimension"
                        tick={{ fill: shadcnColors.primary, fontSize: 12 }}
                        tickLine={false}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 1]}
                        tickCount={6}
                        tick={{ fill: shadcnColors.muted, fontSize: 10 }}
                        tickFormatter={value => `${value * 100}%`}
                    />
                    <Radar
                        name="模型评分"
                        dataKey="score"
                        stroke={shadcnColors.accent}
                        fill={shadcnColors.accent}
                        fillOpacity={0.3}
                        strokeWidth={2}
                        dot={{ stroke: shadcnColors.accent, strokeWidth: 2, r: 4, fill: shadcnColors.card }}
                        activeDot={{ r: 6, stroke: shadcnColors.card, strokeWidth: 2 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        content={() => (
                            <div className="flex justify-center mt-2 text-sm">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-accent mr-2"></div>
                                    <span className="text-muted-foreground">模型评分</span>
                                </div>
                            </div>
                        )}
                    />
                </RadarChart>
            </ResponsiveContainer>

            <div className="flex justify-center mt-4">
                <div className="flex items-center text-xs text-muted-foreground">
                    <div className="w-3 h-3 rounded-full bg-green-500/30 mr-1 border border-green-500"></div>
                    <span>优秀 (80-100%)</span>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/30 ml-4 mr-1 border border-yellow-500"></div>
                    <span>良好 (60-79%)</span>
                    <div className="w-3 h-3 rounded-full bg-red-500/30 ml-4 mr-1 border border-red-500"></div>
                    <span>需改进 (0-59%)</span>
                </div>
            </div>
        </div>
    );
};
