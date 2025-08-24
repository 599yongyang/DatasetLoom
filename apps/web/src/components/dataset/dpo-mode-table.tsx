import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MentionsTextarea from '@/components/ui/mentions-textarea';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DatasetSamples } from '@/types/interfaces';

export default function DpoModeTable({ datasets }: { datasets: DatasetSamples[] }) {
    const router = useRouter();
    const { projectId } = useParams<{ projectId: string }>();
    return (
        <div className="space-y-6">
            {datasets.map((item: any) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-xl leading-tight">
                            <div
                                onClick={() => router.push(`/project/${projectId}/dataset/qa/${item.questionId}?dssId=${item.datasetChosenId}`)}>
                                <MentionsTextarea value={item.prompt} readOnly cursor={'pointer'} />
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* 偏好答案 */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <ThumbsUp className="w-4 h-4 text-green-600" />
                                    <span className="font-medium text-green-600">偏好答案</span>
                                </div>
                                <div title={item.chosen}
                                     className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 min-h-20">
                                    <p className="text-sm leading-relaxed line-clamp-2">
                                        {item.chosen}
                                    </p>
                                </div>
                            </div>

                            {/* 拒绝答案 */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <ThumbsDown className="w-4 h-4 text-red-600" />
                                    <span className="font-medium text-red-600">拒绝答案</span>
                                </div>
                                <div title={item.chosen}
                                     className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800 min-h-20">
                                    <p className="text-sm leading-relaxed line-clamp-2">{item.rejected}</p>
                                </div>
                            </div>
                        </div>
                        {/*<div className={'flex flex-1 mt-3  justify-between items-center'}>*/}
                        {/*    <div className={'text-sm text-muted-foreground'}>*/}
                        {/*        {new Date(item.updatedAt).toLocaleString()}*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
