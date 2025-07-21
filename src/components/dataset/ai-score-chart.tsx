import React, { useState } from 'react';
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
import type { DatasetEvaluation } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Atom, Plus } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { WithPermission } from '@/components/common/permission-wrapper';
import { ContextType, ModelConfigType, ProjectRole } from '@/server/db/types';
import { useParams } from 'next/navigation';
import { useDatasetEvalList } from '@/hooks/query/use-dataset-eval';
import { useAtomValue } from 'jotai/index';
import { selectedModelInfoAtom } from '@/atoms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ModelTag } from '@lobehub/icons';
import type { UIContextType } from '@/lib/data-dictionary';

export const AIScoreDashboard = ({ dssId, contextType }: { dssId: string; contextType: UIContextType }) => {
    const { projectId }: { projectId: string } = useParams();
    const [isScoring, setIsScoring] = useState(false);
    const { data: datasetEvalList, refresh } = useDatasetEvalList({
        projectId,
        sampleId: dssId,
        sampleType: contextType
    });
    const model = useAtomValue(selectedModelInfoAtom);

    const handleAIScore = () => {
        if (!checkModel()) {
            toast.warning('请选择支持对应能力的模型进行评分');
            return;
        }
        setIsScoring(true);

        toast.promise(
            axios.post(`/api/project/${projectId}/datasets/ai-score`, {
                dssId: dssId,
                modelId: model.id
            }),
            {
                loading: 'AI 正在进行评分中...',
                success: data => {
                    if (data.data.success) {
                        void refresh();
                        return '处理成功';
                    } else {
                        return '处理失败';
                    }
                },
                error: error => {
                    console.error('处理失败:', error);
                    return '处理失败';
                },
                finally: () => {
                    setIsScoring(false);
                }
            }
        );
    };

    const checkModel = () => {
        if (contextType === ContextType.IMAGE) {
            return model.type.includes(ModelConfigType.VISION);
        }
        if (contextType === ContextType.TEXT) {
            return model.type.includes(ModelConfigType.TEXT);
        }
        return false;
    };

    // Process evaluation data for each model
    const getModelEvaluationData = (evalItem: DatasetEvaluation) => {
        const getSafeScore = (value: number | null) => {
            if (value === null || isNaN(value)) return 0;
            return Math.max(0, Math.min(1, value));
        };

        return [
            {
                dimension: '事实准确性',
                score: getSafeScore(evalItem.factualAccuracyScore),
                diagnosis: evalItem.factualInfo || '无诊断信息'
            },
            {
                dimension: '逻辑完备性',
                score: getSafeScore(evalItem.logicalIntegrityScore),
                diagnosis: evalItem.logicalInfo || '无诊断信息'
            },
            {
                dimension: '表达质量',
                score: getSafeScore(evalItem.expressionQualityScore),
                diagnosis: evalItem.expressionInfo || '无诊断信息'
            },
            {
                dimension: '安全合规',
                score: getSafeScore(evalItem.safetyComplianceScore),
                diagnosis: evalItem.safetyInfo || '无诊断信息'
            },
            {
                dimension: '综合得分',
                score: getSafeScore(evalItem.compositeScore),
                diagnosis: evalItem.compositeInfo || '无诊断信息'
            }
        ];
    };

    // Calculate overall rating
    const getOverallRating = (compositeScore: number | null) => {
        const composite = compositeScore === null ? 0 : Math.max(0, Math.min(1, compositeScore));
        if (composite >= 0.8) return { text: '优秀', color: 'text-green-500' };
        if (composite >= 0.6) return { text: '良好', color: 'text-yellow-500' };
        return { text: '需改进', color: 'text-red-500' };
    };

    return (
        <>
            {datasetEvalList.length > 0 ? (
                <Tabs defaultValue={datasetEvalList[0]?.id || 'new'} className="items-center">
                    <TabsList className="text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 overflow-x-auto scrollbar-hide">
                        <div className="flex space-x-2 min-w-max">
                            {datasetEvalList.map((item: DatasetEvaluation) => (
                                <TabsTrigger
                                    key={item.id}
                                    value={item.id}
                                    className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-shrink-0"
                                >
                                    <ModelTag model={item.model} type={'color'} />
                                </TabsTrigger>
                            ))}
                            <TabsTrigger
                                value="new"
                                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                            </TabsTrigger>
                        </div>
                    </TabsList>

                    {datasetEvalList.map((evalItem: DatasetEvaluation) => {
                        const modelEvaluationData = getModelEvaluationData(evalItem);
                        const overallRating = getOverallRating(evalItem.compositeScore);

                        return (
                            <TabsContent key={evalItem.id} value={evalItem.id}>
                                <div className="mx-auto p-6">
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
                                                <div
                                                    className={`px-3 py-1 rounded-full ${overallRating.color} bg-opacity-20`}
                                                >
                                                    <span className="text-sm font-medium">
                                                        整体评级: {overallRating.text}
                                                    </span>
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
                                                    const barWidth = Math.max(5, scorePercent);

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="border-b pb-3 last:border-0 last:pb-0"
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm font-medium">
                                                                    {item.dimension}
                                                                </span>
                                                                <span className="font-bold text-primary">
                                                                    {scorePercent.toFixed(1)}%
                                                                </span>
                                                            </div>
                                                            <div className="mt-1">
                                                                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${barColor}`}
                                                                        style={{ width: `${barWidth}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1 break-words">
                                                                {item.diagnosis}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-4 pt-4 border-t">
                                                <h4 className="font-medium text-sm mb-2 text-primary">评估结论</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {evalItem.compositeInfo || '无评估结论'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        );
                    })}
                    {/* New evaluation tab */}
                    <TabsContent value="new" className={'w-full'}>
                        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center space-y-4">
                            <div className="flex justify-center">
                                <Atom className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium">添加新的 AI 评分</h3>
                            <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                                <div className="text-sm text-muted-foreground max-w-md mx-auto space-y-1">
                                    <p>使用AI模型对当前答案进行自动质量评估</p>
                                    <p className="text-xs">
                                        建议: 使用不同于生成此答案的模型进行评估，以获得更客观结果
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleAIScore} className="gap-1 px-4 py-2">
                                    <Atom className="w-4 h-4" />
                                    生成 AI 评分
                                </Button>
                            </WithPermission>
                        </div>
                    </TabsContent>
                </Tabs>
            ) : isScoring ? (
                <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">AI 正在评分中 ...</p>
                </div>
            ) : (
                <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center space-y-4">
                    <div className="flex justify-center">
                        <Atom className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium">暂未进行 AI 评分</h3>
                    <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                        <div className="text-sm text-muted-foreground max-w-md mx-auto space-y-1">
                            <p>使用AI模型对当前答案进行自动质量评估</p>
                            <p className="text-xs">建议: 使用不同于生成此答案的模型进行评估，以获得更客观结果</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleAIScore} className="gap-1 px-4 py-2">
                            <Atom className="w-4 h-4" />
                            生成 AI 评分
                        </Button>
                    </WithPermission>
                </div>
            )}
        </>
    );
};

// ModelRadarChart component remains the same
const ModelRadarChart = ({ modelData }: { modelData: any }) => {
    const shadcnColors = {
        primary: 'hsl(222.2, 47.4%, 11.2%)',
        secondary: 'hsl(210, 40%, 96.1%)',
        accent: 'hsl(217.2, 91.2%, 59.8%)',
        muted: 'hsl(210, 40%, 96.1%)',
        border: 'hsl(214.3, 31.8%, 91.4%)',
        card: 'hsl(0, 0%, 100%)'
    };

    const safeModelData = modelData.map((item: any) => ({
        ...item,
        score: isNaN(item.score) || item.score === null ? 0 : Math.max(0, Math.min(1, item.score))
    }));

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
