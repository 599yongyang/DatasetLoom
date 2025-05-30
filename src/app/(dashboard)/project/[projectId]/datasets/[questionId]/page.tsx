'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircleQuestion, Save, SaveOff, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import axios from 'axios';
import { toast } from 'sonner';
import { Loading } from '@/components/loading';
import { useTranslation } from 'react-i18next';
import { useDatasetsInfo } from '@/hooks/query/use-datasets';
import { ConfirmAlert } from '@/components/confirm-alert';
import DatasetDetail from '@/components/dataset/dataset-detail';

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation('dataset');
    const { projectId, questionId } = useParams<{ projectId: string; questionId: string }>();
    const dssId = searchParams.get('dssId');
    const [qId, setQid] = useState<string>(questionId as string);
    const [activeAnswerId, setActiveAnswerId] = useState<string>(dssId as string);
    const {
        datasets: data,
        confirmedCount,
        total,
        isError,
        isLoading,
        refresh
    } = useDatasetsInfo({
        projectId,
        questionId: qId
    });
    const [confirmed, setConfirmed] = useState<boolean>(data.confirmed);

    if (isError) return <div>failed to load</div>;
    if (isLoading)
        return (
            <div className={'flex items-center justify-center p-60'}>
                <Loading variant={'infinite'} className={'w-10 h-10 '} />
            </div>
        );

    const handleNavigate = async (direction: 'prev' | 'next') => {
        const response = await axios.get(`/api/project/${projectId}/questions/${qId}?operateType=${direction}`);
        if (response.data.data) {
            const data = response.data.data;
            setQid(data.id);
            setActiveAnswerId(data.DatasetSamples[0].id);
            router.replace(`/project/${projectId}/datasets/${data.id}?dssId=${data.DatasetSamples[0].id}`);
        } else {
            toast.warning(`已经是${direction === 'next' ? '最后' : '第'}一条数据了`);
        }
    };

    const handleConfirm = async (confirmed: boolean) => {
        try {
            const response = await axios.patch(`/api/project/${projectId}/questions/${qId}`, { confirmed });
            if (response.status !== 200) {
                toast.success(`${confirmed ? '确认' : '取消'}失败`);
                return;
            }
            setConfirmed(prev => !prev);
            toast.success(`${confirmed ? '确认' : '取消'}成功`);
            void refresh();
        } catch (error) {
            toast.error(`${confirmed ? '确认' : '取消'}失败,请重试`);
        }
    };

    const handleDelete = async () => {
        if (!projectId || !qId) return;

        let nextDataset = null;
        try {
            const nextRes = await axios.get(`/api/project/${projectId}/questions/${qId}?operateType=next`);
            nextDataset = nextRes.data;
        } catch (err) {}
        if (!nextDataset) {
            const prevRes = await axios.get(`/api/project/${projectId}/questions/${qId}?operateType=prev`);
            nextDataset = prevRes.data;
        }

        toast.promise(axios.delete(`/api/project/${projectId}/questions/${qId}`), {
            loading: '删除中...',
            success: () => {
                if (nextDataset) {
                    setQid(nextDataset.id);
                    setActiveAnswerId(nextDataset.DatasetSamples[0].id);
                    router.replace(
                        `/project/${projectId}/datasets/${nextDataset.id}?dssId=${nextDataset.DatasetSamples[0].id}`
                    );
                } else {
                    router.push(`/project/${projectId}/datasets`);
                }
                return '删除成功';
            },
            error: e => e.response?.data?.message || '删除失败'
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl min-h-screen">
            {/* 返回按钮和操作栏 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex items-center gap-1 border-gray-300 hover:bg-gray-100"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">返回列表</span>
                </Button>
                <div className="text-sm text-muted-foreground">
                    {t('info', {
                        total,
                        confirmedCount
                    })}
                    ({((confirmedCount / total) * 100).toFixed(2)}%)
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button variant="ghost" size="icon" onClick={() => handleNavigate('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleNavigate('next')}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <ConfirmAlert
                        title={'确认要删除此问题嘛？'}
                        message={'相关回答也将会全部删除'}
                        onConfirm={handleDelete}
                    >
                        <Button variant="destructive" className="flex items-center gap-2 text-white">
                            <Trash2 />
                            删除
                        </Button>
                    </ConfirmAlert>
                    {confirmed ? (
                        <Button variant={'outline'} onClick={() => handleConfirm(false)}>
                            <SaveOff />
                            取消保留
                        </Button>
                    ) : (
                        <Button className="flex items-center gap-2" onClick={() => handleConfirm(true)}>
                            <Save />
                            确认保留
                        </Button>
                    )}
                </div>
            </div>
            <Progress value={(confirmedCount / total) * 100} className="mb-6" />
            <div className="text-2xl font-bold  flex-1 flex items-center">
                <MessageCircleQuestion className="w-6 h-6 mr-2" />
                {data.question}
            </div>
            <DatasetDetail
                datasetSamples={data.DatasetSamples}
                refresh={refresh}
                dssId={activeAnswerId}
                pp={data.PreferencePair}
            />
        </div>
    );
}
