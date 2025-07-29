import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquarePlus, Plus, Wand2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { nanoid } from 'nanoid';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ModelSelect } from '@/components/common/model-select';
import type { ImageBlock } from '@prisma/client';
import BlockHighlight from '@/components/image-block/block-highlight';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { ModelConfigType, ContextType } from '@/server/db/types';
import { toast } from 'sonner';
import MentionsTextarea from '@/components/ui/mentions-textarea';

interface Question {
    id: string;
    question: string;
    type: 'manual' | 'ai-generated';
}

export default function AddQuestionDialog({
    questionDialog,
    setQuestionDialog,
    imageId,
    name,
    width,
    height,
    block
}: {
    questionDialog: boolean;
    setQuestionDialog: (showQuestionDialog: boolean) => void;
    imageId: string;
    name: string;
    width: number;
    height: number;
    block: ImageBlock[];
}) {
    // if (block.length === 0) return null;
    const { projectId } = useParams();
    const [modelValue, setModelValue] = useState('');
    const [newQuestion, setNewQuestion] = useState('');
    const [customPrompt, setCustomPrompt] = useState(
        '基于这个图像分块和其中的标注信息，生成5个相关的问题。问题应该涵盖：1. 目标识别和计数 2. 位置和空间关系 3. 特征描述 4. 分类和属性 5. 场景理解'
    );
    const [isGenerating, setIsGenerating] = useState(false);
    const [questionList, setQuestionList] = useState<Question[]>([]);
    const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
    const [inputError, setInputError] = useState('');

    // 准备提及数据
    const mentionData = block.map(block => ({
        id: block.id,
        display: block.label
    }));

    // 重置状态当对话框关闭
    useEffect(() => {
        if (!questionDialog) {
            setNewQuestion('');
            setQuestionList([]);
            setInputError('');
        }
    }, [questionDialog]);

    const handleAddManualQuestion = () => {
        if (!newQuestion.trim()) {
            setInputError('问题不能为空');
            return;
        }

        // 检查提及是否有效
        const mentions = newQuestion.match(/@\[([^\]]+)\]\(([^)]+)\)/g);
        if (mentions) {
            for (const mention of mentions) {
                const idMatch = mention.match(/\(([^)]+)\)/);
                if (idMatch && !mentionData.find(item => item.id === idMatch[1])) {
                    setInputError(`无效的提及: ${mention}`);
                    return;
                }
            }
        }

        const question: Question = {
            id: nanoid(),
            question: newQuestion.trim(),
            type: 'manual'
        };
        setQuestionList(prevQuestions => [...prevQuestions, question]);
        setNewQuestion('');
        setInputError('');
    };

    const handleGenerateAIQuestions = async () => {
        if (!block || !customPrompt.trim()) {
            setInputError('请输入有效的提示词');
            return;
        }
        if (!modelValue) {
            setInputError('请选择AI模型');
            return;
        }

        setIsGenerating(true);
        setInputError('');

        axios
            .post(`/api/project/${projectId}/images/gen-questions`, {
                imageId: imageId,
                prompt: customPrompt,
                modelId: modelValue
            })
            .then(res => {
                const data: string[] = res.data.data;
                const questions: Question[] = data.map(item => {
                    return {
                        id: nanoid(),
                        question: item,
                        type: 'ai-generated'
                    };
                });
                setQuestionList(prev => [...prev, ...questions]);
            })
            .catch(err => {
                console.log(err);
                setInputError('生成问题失败');
            })
            .finally(() => {
                setIsGenerating(false);
            });
    };

    const handleDeleteQuestion = (id: string) => {
        setQuestionList(prev => prev.filter(q => q.id !== id));
    };

    const handleSaveQuestions = () => {
        if (questionList.length === 0) {
            setInputError('请至少添加一个问题');
            return;
        }

        axios
            .post(`/api/project/${projectId}/questions`, {
                questions: questionList.map(q => q.question),
                contextType: ContextType.IMAGE,
                contextId: imageId,
                contextName: name
            })
            .then(response => {
                toast.success('保存成功');
                setQuestionDialog(false);
            })
            .catch(error => {
                console.error(error);
                toast.error('保存失败');
            });
    };

    return (
        <Dialog open={questionDialog} onOpenChange={setQuestionDialog}>
            <DialogContent className="max-w-4xl min-h-[80vh] max-h-[95vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquarePlus className="w-5 h-5 text-primary" />
                        <span>为标注区域创建问题</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                    {/* 左侧 - 分块预览 */}
                    <div className="space-y-4 flex flex-col">
                        <div className="relative bg-gray-50 rounded-lg overflow-hidden border flex-1 min-h-[300px]">
                            <BlockHighlight imageId={imageId} name={name} block={block} width={width} height={height} />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p>提示：在问题中使用 @ 可以提及图像中的标注区域</p>
                        </div>
                    </div>

                    {/* 右侧 - 问题管理 */}
                    <div className="space-y-4 flex flex-col overflow-hidden">
                        <Tabs
                            value={activeTab}
                            onValueChange={v => {
                                setActiveTab(v as 'manual' | 'ai');
                                setInputError('');
                            }}
                            className=" overflow-hidden"
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="manual">手动添加</TabsTrigger>
                                <TabsTrigger value="ai">AI生成</TabsTrigger>
                            </TabsList>

                            <div className="overflow-hidden pt-4">
                                <TabsContent value="manual" className=" overflow-hidden">
                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="new-question">添加新问题</Label>
                                            <div className="mt-2 relative">
                                                <MentionsTextarea
                                                    value={newQuestion}
                                                    className={' border rounded-md p-2 w-full min-h-[100px] '}
                                                    data={mentionData}
                                                    onChange={value => setNewQuestion(value)}
                                                />
                                            </div>
                                            {inputError && <p className="mt-1 text-sm text-red-500">{inputError}</p>}
                                        </div>
                                        <Button
                                            onClick={handleAddManualQuestion}
                                            disabled={!newQuestion.trim()}
                                            className="w-full mt-auto"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            添加问题
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="ai" className="flex-1 flex flex-col overflow-hidden">
                                    <div className="space-y-3 flex-1 flex flex-col">
                                        <div>
                                            <Label htmlFor="ai-model">AI模型</Label>
                                            <div className="mt-2">
                                                <ModelSelect
                                                    value={modelValue}
                                                    setValue={setModelValue}
                                                    filter={ModelConfigType.VISION}
                                                    className={'w-full'}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="custom-prompt">AI提示词</Label>
                                            <Textarea
                                                id="custom-prompt"
                                                value={customPrompt}
                                                onChange={e => {
                                                    setCustomPrompt(e.target.value);
                                                    setInputError('');
                                                }}
                                                rows={4}
                                                className="mt-2 text-sm"
                                                placeholder="输入提示词指导AI生成问题..."
                                            />
                                        </div>
                                        {inputError && <p className="mt-1 text-sm text-red-500">{inputError}</p>}
                                        <Button
                                            onClick={handleGenerateAIQuestions}
                                            disabled={isGenerating || !customPrompt.trim()}
                                            className="w-full mt-auto"
                                        >
                                            {isGenerating ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Wand2 className="w-4 h-4 mr-2" />
                                            )}
                                            {isGenerating ? '生成中...' : '生成问题'}
                                        </Button>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>

                        {/* 当前问题列表 */}
                        <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between">
                                <Label>问题列表</Label>
                                <Badge variant="secondary">{questionList.length} 个问题</Badge>
                            </div>
                            <ScrollArea className="flex-1 h-12 border rounded-lg">
                                {questionList.length > 0 ? (
                                    <div className="divide-y">
                                        {questionList.map(question => (
                                            <div
                                                key={question.id}
                                                className="flex items-start gap-3 p-3 hover:bg-accent transition-colors group"
                                            >
                                                <Badge
                                                    variant={question.type === 'ai-generated' ? 'default' : 'outline'}
                                                    className="flex-shrink-0 mt-0.5"
                                                >
                                                    {question.type === 'ai-generated' ? 'AI' : '手动'}
                                                </Badge>
                                                <div className="flex-1 min-w-0">
                                                    <MentionsTextarea
                                                        value={question.question}
                                                        readOnly
                                                        className={'text-sm'}
                                                    />
                                                </div>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteQuestion(question.id)}
                                                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>删除问题</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                        <MessageSquarePlus className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">暂无问题</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {activeTab === 'manual'
                                                ? '手动添加或使用AI生成问题'
                                                : '输入提示词后生成问题'}
                                        </p>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-3 pt-4 border-t">
                            <Button
                                onClick={handleSaveQuestions}
                                disabled={questionList.length === 0}
                                className="flex-1"
                            >
                                保存问题 ({questionList.length})
                            </Button>
                            <Button variant="outline" onClick={() => setQuestionDialog(false)}>
                                取消
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
