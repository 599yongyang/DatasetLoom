import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MentionsTextarea from '@/components/ui/mentions-textarea';
import { Star } from 'lucide-react';
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DatasetSamples } from '@/types/interfaces';
import { Badge } from '@/components/ui/badge';
import { ModelTag } from '@lobehub/icons';

export default function SftModeTable({ datasets }: { datasets: DatasetSamples[] }) {
    const router = useRouter();
    const { projectId } = useParams<{ projectId: string }>();
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {datasets.map(item => (
                <Card key={item.id} className="flex flex-col hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg leading-tight">
                            <div
                                onClick={() => router.push(`/project/${projectId}/dataset/qa/${item.questionId}?dssId=${item.id}`)}>
                                <MentionsTextarea value={item.question} readOnly cursor={'pointer'} />
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <CardDescription className="min-h-10" title={item.answer}>
                            <p className={'text-sm leading-relaxed line-clamp-3'}>
                                {item.answer}
                            </p>
                        </CardDescription>
                    </CardContent>
                    <CardFooter className="mt-auto">
                        <div className="w-full">
                            <div className="gap-2 space-x-2 py-2 flex flex-wrap">
                                {item.referenceLabel !== '' &&
                                    item.referenceLabel?.split(',').map((label, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="text-xs whitespace-nowrap"
                                        >
                                            {label}
                                        </Badge>
                                    ))}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <div className={'flex items-center gap-2'}>
                                    <Badge variant="default" className="text-xs">
                                        <Star className="w-3 h-3 mr-1" />
                                        主答案
                                    </Badge>
                                    <ModelTag model={item.model} type="color" />
                                </div>

                                <div className={'flex items-center'}>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(item.createdAt).toLocaleString()}
                                </span>
                                </div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
