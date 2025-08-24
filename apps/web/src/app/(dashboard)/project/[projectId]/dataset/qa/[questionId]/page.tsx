'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircleQuestion, Save, SaveOff, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loading } from '@/components/common/loading';
import { useTranslation } from 'react-i18next';
import { ConfirmAlert } from '@/components/common/confirm-alert';
import DatasetDetail from '@/components/dataset/dataset-detail';
import { ProjectRole } from '@repo/shared-types';
import { WithPermission } from '@/components/common/permission-wrapper';
import MentionsTextarea from '@/components/ui/mentions-textarea';
import apiClient from '@/lib/axios';
import { useDelete } from '@/hooks/use-delete';
import { useQADatasetInfo } from '@/hooks/query/use-qa-dataset';

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { deleteItems } = useDelete();
    const { t } = useTranslation('dataset');
    const { projectId, questionId } = useParams<{ projectId: string; questionId: string }>();
    const dssId = searchParams.get('dssId');
    const [qId, setQid] = useState<string>(questionId as string);
    const [activeAnswerId, setActiveAnswerId] = useState<string>(dssId as string);
    const { datasets: data, confirmedCount, total, isError, isLoading, refresh } = useQADatasetInfo({
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
        const response = await apiClient.get(`/${projectId}/qa-dataset/navigation/${qId}?operateType=${direction}`);
        if (response.data.data.data) {
            const data = response.data.data.data;
            setQid(data.id);
            setActiveAnswerId(data.DatasetSamples[0].id);
            router.replace(`/project/${projectId}/dataset/qa/${data.id}?dssId=${data.DatasetSamples[0].id}`);
        } else {
            toast.warning(`已经是${direction === 'next' ? '最后' : '第'}一条数据了`);
        }
    };

    const handleConfirm = async (confirmed: boolean) => {
        try {
            const response = await apiClient.patch(`/${projectId}/question/setConfirm`, { id: qId, confirmed });
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
            // 尝试获取下一个数据集
            const nextRes = await apiClient.get(`/${projectId}/qa-dataset/navigation/${qId}?operateType=next`);
            if (nextRes.data?.data?.data) {
                nextDataset = nextRes.data.data.data;
            }
        } catch (err) {
            console.warn('Failed to get next dataset:', err);
        }

        // 如果没有下一个，则尝试获取上一个
        if (!nextDataset) {
            try {
                const prevRes = await apiClient.get(`/${projectId}/qa-dataset/navigation/${qId}?operateType=prev`);
                if (prevRes.data?.data?.data) {
                    nextDataset = prevRes.data.data.data;
                }
            } catch (err) {
                console.warn('Failed to get previous dataset:', err);
            }
        }

        await deleteItems(`/${projectId}/question/delete`, [qId], {
            onSuccess: () => {
                if (nextDataset && nextDataset.DatasetSamples && nextDataset.DatasetSamples.length > 0) {
                    // 确保数据结构安全后再访问
                    const firstSample = nextDataset.DatasetSamples[0];
                    if (firstSample && firstSample.id) {
                        setQid(nextDataset.id);
                        setActiveAnswerId(firstSample.id);
                        router.replace(
                            `/project/${projectId}/dataset/qa/${nextDataset.id}?dssId=${firstSample.id}`
                        );
                    }
                }
                // 如果没有下一个或上一个，或者数据结构有问题，返回列表页
                router.push(`/project/${projectId}/dataset/qa`);
            }
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
                    <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
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
                    </WithPermission>
                    <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
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
                    </WithPermission>
                </div>
            </div>
            <Progress value={(confirmedCount / total) * 100} className="mb-6" />
            <div className="text-2xl font-bold  flex-1 flex items-center">
                <MessageCircleQuestion className="w-6 h-6 mr-2" />
                <MentionsTextarea className={'text-lg'} value={data.question} readOnly />
            </div>
            <DatasetDetail questionInfo={data} refresh={refresh} dssId={activeAnswerId} />
        </div>
    );
}
