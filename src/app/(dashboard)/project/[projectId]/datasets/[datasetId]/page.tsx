'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, HardDrive, Quote, Save, ScrollText, Sparkles, Tag, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Datasets } from '@prisma/client';
import axios from 'axios';
import { toast } from 'sonner';
import { Loading } from '@/components/loading';
import { useTranslation } from 'react-i18next';
import { useDatasetsId } from '@/hooks/query/use-datasets';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Page() {
    const router = useRouter();
    const { t } = useTranslation('dataset');
    const { projectId, datasetId } = useParams<{ projectId: string; datasetId: string }>();

    const { datasets: data, total, confirmedCount, isError, isLoading } = useDatasetsId({ projectId, datasetId });
    const [dataset, setDataset] = useState<Datasets>(data || ({} as Datasets));

    useEffect(() => {
        if (data) {
            setDataset(data);
        }
    }, [data]);

    if (isError) return <div>failed to load</div>;
    if (isLoading)
        return (
            <div className={'flex items-center justify-center p-60'}>
                <Loading variant={'infinite'} className={'w-10 h-10 '} />
            </div>
        );
    const handleChange = (field: string, value: string) => {
        setDataset(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleNavigate = async (direction: 'prev' | 'next') => {
        const response = await axios.get(`/api/project/${projectId}/datasets/${datasetId}?operateType=${direction}`);
        if (response.data) {
            router.push(`/project/${projectId}/datasets/${response.data.id}`);
        } else {
            toast.warning(`已经是${direction === 'next' ? '最后' : '第'}一条数据了`);
        }
    };

    const handleConfirm = async () => {
        try {
            const response = await axios.put(`/api/project/${projectId}/datasets/${datasetId}`, { confirmed: true });
            if (response.status !== 200) {
                toast.success('确认失败');
                return;
            }
            toast.success('确认成功');
        } catch (error) {
            toast.error('确认失败，请重试');
        }
    };

    const handleDelete = async () => {
        if (!projectId || !datasetId) return;

        try {
            // 显示加载中提示
            toast.loading('删除中…');

            let nextDataset = null;
            try {
                const nextRes = await axios.get(`/api/project/${projectId}/datasets/${datasetId}?operateType=next`);
                nextDataset = nextRes.data;
            } catch (err) {}
            if (!nextDataset) {
                const prevRes = await axios.get(`/api/project/${projectId}/datasets/${datasetId}?operateType=prev`);
                nextDataset = prevRes.data;
            }
            await axios.delete(`/api/project/${projectId}/datasets/${datasetId}`);
            toast.dismiss();
            if (nextDataset) {
                toast.success('删除成功');
                router.push(`/project/${projectId}/datasets/${nextDataset.id}`);
            } else {
                toast.success('删除成功，已无更多数据');
                router.push(`/project/${projectId}/datasets`);
            }
        } catch (error) {
            console.error('删除失败:', error);
            toast.error('删除失败，请重试');
        }
    };

    return (
        <div className="@container/main mx-auto py-3 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2 bg-gray-100">
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('detail.back_list')}</span>
                </Button>
                <div className="text-sm text-muted-foreground">
                    {t('info', {
                        total: total,
                        confirmedCount: confirmedCount
                    })}
                    ({((confirmedCount / total) * 100).toFixed(2)}%)
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleNavigate('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleNavigate('next')}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} className="flex items-center gap-2 text-white">
                        <Trash2 />
                        {t('detail.delete_btn')}
                    </Button>
                    <Button className="flex items-center gap-2" disabled={dataset.confirmed} onClick={handleConfirm}>
                        <Save />
                        {t('detail.reserve_btn')}
                    </Button>
                </div>
            </div>

            <Progress value={(confirmedCount / total) * 100} className="mb-6" />

            <Card className={'overflow-y-auto h-[75vh]'}>
                <CardHeader>
                    {/*<p className="text-lg p-4">问题</p>*/}
                    <h2 className="text-xl pl-2 font-semibold">{dataset.question}</h2>
                </CardHeader>

                <CardContent>
                    <div className={'flex gap-2 items-center p-4'}>
                        <span className={'text-bold'}>{t('detail.answer')}</span>
                        <ScrollText className="h-4 w-4" />
                    </div>

                    <Textarea
                        value={dataset.answer}
                        onChange={e => handleChange('answer', e.target.value)}
                        className="max-h-[400px]"
                    />
                    <div className={'flex gap-2 items-center p-4 '}>
                        <span>{t('detail.cot')}</span>
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <Textarea
                        value={dataset.cot}
                        onChange={e => handleChange('cot', e.target.value)}
                        className="max-h-[400px] whitespace-pre-wrap"
                    />

                    {dataset.evidence ? (
                        <>
                            <div className={'flex gap-2 items-center p-4 '}>
                                <span>引用内容</span>
                                <Quote className="h-4 w-4" />
                            </div>
                            <Table>
                                <TableHeader className="bg-transparent">
                                    <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
                                        <TableHead>来源位置</TableHead>
                                        <TableHead>依据内容</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="[&_td:first-child]:rounded-l-lg [&_td:last-child]:rounded-r-lg">
                                    {JSON.parse(dataset.evidence).map((item: { location: string; text: string }) => (
                                        <TableRow
                                            key={item.location}
                                            className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r"
                                        >
                                            <TableCell>{item.location}</TableCell>
                                            <TableCell>{item.text}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </>
                    ) : null}

                    <div className={'flex gap-2 items-center p-4 '}>
                        <span>参考标签</span>
                        <Tag className="h-4 w-4" />
                    </div>
                    <div className={' flex p-2 gap-3'}>
                        {dataset.referenceLabel &&
                            dataset.referenceLabel.split(',').map(tag => (
                                <Badge className={'text-sm'} variant="outline">
                                    {tag}
                                </Badge>
                            ))}
                    </div>

                    <div className={'flex gap-2 items-center p-4 '}>
                        <span>{t('detail.metadata')}</span>
                        <HardDrive className="h-4 w-4" />
                    </div>
                    <div className={' flex p-2 gap-3'}>
                        <Badge className={'text-sm'} variant="outline">
                            {t('detail.chunk')}: {dataset.chunkName}
                        </Badge>
                        <Badge className={'text-sm'} variant="outline">
                            {t('detail.model')}: {dataset.model}
                        </Badge>
                        <Badge className={'text-sm'} variant="outline">
                            {t('detail.createdAt')}: {new Date(dataset.createdAt).toLocaleString('zh-CN')}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
