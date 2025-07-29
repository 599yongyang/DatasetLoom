'use client';

import type { DatasetSamples, PreferencePair } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, Star, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import axios from 'axios';
import { Textarea } from '@/components/ui/textarea';
import { ModelTag } from '@lobehub/icons';
import { WithPermission } from '@/components/common/permission-wrapper';
import { ProjectRole } from '@/server/db/types';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function AnswerCard({
    activeAnswer,
    pp,
    count,
    refresh
}: {
    activeAnswer: DatasetSamples;
    pp: PreferencePair;
    count: number;
    refresh: () => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [answer, setAnswer] = useState(activeAnswer.answer);
    const [isSaving, setIsSaving] = useState(false);
    const [originalAnswer, setOriginalAnswer] = useState(activeAnswer.answer);

    const getPreferenceBadge = (id: string) => {
        if (!pp) return null;
        if (id === pp.datasetChosenId) {
            return (
                <Badge className="bg-green-500 hover:bg-green-600">
                    <ThumbsUp className="w-3 h-3 mr-1" /> 偏好
                </Badge>
            );
        } else if (id === pp.datasetRejectId) {
            return (
                <Badge variant="destructive">
                    <ThumbsDown className="w-3 h-3 mr-1" /> 拒绝
                </Badge>
            );
        }
        return null;
    };

    const handlePP = async (type: 'chosen' | 'rejected') => {
        if (!activeAnswer) {
            toast.error('当前答案为空，无法操作');
            return;
        }

        const { projectId, questionId, question, id: answerId, answer } = activeAnswer;

        const newPP = {
            id: pp?.id ?? nanoid(),
            projectId,
            questionId,
            prompt: question,
            chosen: pp?.chosen ?? '',
            rejected: pp?.rejected ?? '',
            datasetChosenId: pp?.datasetChosenId ?? '',
            datasetRejectId: pp?.datasetRejectId ?? ''
        } as PreferencePair;

        if (type === 'chosen') {
            newPP.chosen = answer;
            newPP.datasetChosenId = answerId;
            if (newPP.rejected === answer && newPP.datasetRejectId === answerId) {
                newPP.rejected = '';
                newPP.datasetRejectId = '';
            }
        } else if (type === 'rejected') {
            newPP.rejected = answer;
            newPP.datasetRejectId = answerId;
            if (newPP.chosen === answer && newPP.datasetChosenId === answerId) {
                newPP.chosen = '';
                newPP.datasetChosenId = '';
            }
        }

        try {
            await axios.post(`/api/project/${projectId}/preference-pair`, newPP);
            toast.success('设置成功');
            refresh();
        } catch (error) {
            console.error('设置失败:', error);
            toast.error('设置失败，请重试');
        }
    };

    const handlePrimaryAnswer = () => {
        axios
            .put(`/api/project/${activeAnswer.projectId}/datasets/primary-answer`, {
                dssId: activeAnswer.id,
                questionId: activeAnswer.questionId
            })
            .then(_ => {
                toast.success('设置成功');
                refresh();
            })
            .catch(error => {
                console.error('设置失败:', error);
                toast.error('设置失败');
            });
    };

    const startEditing = () => {
        setOriginalAnswer(answer);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setAnswer(originalAnswer);
        setIsEditing(false);
    };

    const saveAnswer = async () => {
        if (answer.trim() === '') {
            toast.error('答案不能为空');
            return;
        }

        if (answer === originalAnswer) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            await axios.put(`/api/project/${activeAnswer.projectId}/datasets/${activeAnswer.id}`, {
                answer
            });
            toast.success('修改成功');
            refresh();
            setIsEditing(false);
        } catch (error) {
            console.error('修改失败:', error);
            toast.error('修改失败');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
                <Textarea
                    onChange={e => setAnswer(e.target.value)}
                    value={answer}
                    readOnly={!isEditing}
                    className={cn(
                        'w-full h-32 resize-none',
                        !isEditing && 'read-only:bg-muted',
                        isEditing && 'border-blue-300 ring-1 ring-blue-200'
                    )}
                    disabled={isSaving}
                />
            </div>
            <div className="flex flex-wrap justify-between items-center p-4 gap-2">
                <div className="flex flex-wrap gap-2">
                    {activeAnswer.isPrimaryAnswer && (
                        <Badge>
                            <Star className="w-3 h-3 mr-1" /> 主答案
                        </Badge>
                    )}
                    {getPreferenceBadge(activeAnswer.id)}
                    <ModelTag model={activeAnswer.model} type={'color'} />
                    <p className="text-gray-500 text-sm">置信度: {activeAnswer.confidence * 100}%</p>
                </div>
                <WithPermission required={ProjectRole.EDITOR} projectId={activeAnswer.projectId}>
                    <div className="flex gap-2 flex-wrap">
                        {isEditing ? (
                            <>
                                <Button size="sm" onClick={saveAnswer} className="gap-1" disabled={isSaving}>
                                    <Save className="w-4 h-4" />
                                    {isSaving ? '保存中...' : '保存'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelEditing}
                                    disabled={isSaving}
                                    className="gap-1"
                                >
                                    <X className="w-4 h-4" /> 取消
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" onClick={startEditing} className="gap-1">
                                    <Edit className="w-4 h-4" /> 编辑
                                </Button>
                                {count > 1 && !activeAnswer.isPrimaryAnswer && (
                                    <Button variant="outline" size="sm" onClick={handlePrimaryAnswer} className="gap-1">
                                        <Star className="w-4 h-4" /> 设置为主答案
                                    </Button>
                                )}
                                {pp?.datasetChosenId !== activeAnswer.id && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePP('chosen')}
                                        className="gap-1 text-green-700 border-green-300 hover:bg-green-50"
                                    >
                                        <ThumbsUp className="w-4 h-4" /> 标为偏好
                                    </Button>
                                )}
                                {pp?.datasetRejectId !== activeAnswer.id && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePP('rejected')}
                                        className="gap-1 text-red-700 border-red-300 hover:bg-red-50"
                                    >
                                        <ThumbsDown className="w-4 h-4" /> 标为拒绝
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </WithPermission>
            </div>
        </div>
    );
}
