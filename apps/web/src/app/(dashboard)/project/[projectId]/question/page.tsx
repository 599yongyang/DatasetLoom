'use client';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Trash2, Wand } from 'lucide-react';
import { toast } from 'sonner';
import { Questions } from '@/types/interfaces';
import useQuestions from '@/hooks/query/use-questions';
import { DataTable } from '@/components/questions/data-table';
import { ContextType, ModelConfigType, ProjectRole, PromptTemplateType } from '@repo/shared-types';
import { WithPermission } from '@/components/common/permission-wrapper';
import { useQuestionTableColumns } from '@/hooks/table-columns/use-question';
import { ContextTypeMap } from '@/constants/data-dictionary';
import apiClient from '@/lib/axios';
import { usePagination } from '@/hooks/use-pagination';
import { GenerateStrategyDialog } from '@/components/common/generate-strategy-dialog';
import { useGenerateDataset } from '@/hooks/generate/use-generate-dataset';
import { GenerateItem, StrategyParamsType } from '@/types/generate';
import { PreferencePairDialog } from '@/components/preference-pair/preference-pair-dialog';
import { useAtomValue } from 'jotai';
import { selectedModelInfoAtom } from '@/atoms';

export default function Page() {
    let { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('question');
    const { generateSingleDataset, generateMultipleDataset } = useGenerateDataset();
    const [searchQuery, setSearchQuery] = useState('');
    const [answerFilter, setAnswerFilter] = useState('all');
    const [contextType, setContextType] = useState('all');
    const model = useAtomValue(selectedModelInfoAtom);
    const { pagination, setPagination } = usePagination({
        defaultPageSize: 10,
        resetDeps: [answerFilter, searchQuery, contextType]
    });

    const {
        questions,
        total,
        refresh: mutateQuestions
    } = useQuestions({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        answerFilter,
        searchQuery,
        contextType
    });
    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const [rowSelection, setRowSelection] = useState({});
    const [selectedItems, setSelectedItems] = useState<GenerateItem[]>([]);
    const [open, setOpen] = useState(false);
    const handleOpenDialog = async (q: Questions) => {
        setSelectedItems([{ id: q.id, name: q.question }]);
        if (questions.find(item => item.id === q.id)?.contextType === ContextType.IMAGE) {
            if (!model.type.includes(ModelConfigType.VISION)) {
                toast.warning('请选择支持视觉能力模型');
                return;
            }
            await generateSingleDataset({
                projectId,
                item: { id: q.id, name: q.question },
                datasetStrategyParams: {
                    modelConfigId: model.id,
                    modelName: model.modelName,
                    temperature: model.temperature,
                    maxTokens: model.maxTokens
                } as StrategyParamsType
            });
            void mutateQuestions();
        } else {
            setOpen(true);
        }

    };

    const [questionId, setQuestionId] = useState('');
    const [ppOpen, setPPOpen] = useState(false);
    const handleOpenPPDialog = (qId: string) => {
        setQuestionId(qId);
        setPPOpen(true);
    };

    const columns = useQuestionTableColumns({
        mutateQuestions,
        onOpenDialog: handleOpenDialog,
        onOpenPPDialog: handleOpenPPDialog
    });


    /**
     * 批量删除问题
     */
    const batchDeleteQuestions = async () => {
        toast.promise(
            apiClient.delete(`/${projectId}/question/delete`, {
                params: { ids: Object.keys(rowSelection).join(',') }
            }),
            {
                loading: `正在删除 ${Object.keys(rowSelection).length} 个问题...`,
                success: _ => {
                    mutateQuestions();
                    return `成功删除 ${Object.keys(rowSelection).length} 个问题`;
                },
                error: error => {
                    return error.response?.data?.message || '批量删除问题失败';
                }
            }
        );
    };

    useEffect(() => {
        if (Object.keys(rowSelection).length > 0) {
            setSelectedItems(
                Object.keys(rowSelection).map(id => {
                    const q = questions.find(q => q.id === id);
                    return {
                        id: q?.id || '',
                        name: q?.question || ''
                    };
                })
            );
        }
    }, [rowSelection]);

    const handleGenerateDataset = async (strategyParams: StrategyParamsType) => {
        if (selectedItems.length === 1 && selectedItems[0]) {
            await generateSingleDataset({
                projectId, item: selectedItems[0],
                datasetStrategyParams: strategyParams
            });
        } else {
            await generateMultipleDataset(projectId, selectedItems, strategyParams);
        }
        void mutateQuestions();
    };


    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="sticky top-0 z-10 bg-background/80 s flex items-center justify-between gap-2">
                <div className={'flex gap-2 w-1/2'}>
                    <div className="group relative">
                        <label
                            className="bg-background text-foreground absolute start-1 top-0 z-10 block -translate-y-1/2 px-2 text-xs font-medium group-has-disabled:opacity-50">
                            分类
                        </label>
                        <Select value={contextType} onValueChange={value => {
                            setContextType(value);
                        }}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="状态" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">全部</SelectItem>
                                {Object.entries(ContextTypeMap).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Input
                        className="w-1/3"
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value);
                        }}
                        placeholder={t('search')}
                    />
                    <Select
                        value={answerFilter}
                        onValueChange={value => {
                            setAnswerFilter(value);
                        }}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="状态" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('select_item.all')}</SelectItem>
                            <SelectItem value="answered">{t('select_item.answered')}</SelectItem>
                            <SelectItem value="unanswered">{t('select_item.unanswered')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className={'flex items-center gap-2'}>
                    {/*<Button variant="outline" className={"hover:cursor-pointer"}>*/}
                    {/*    <Plus size={30}/>*/}
                    {/*    <span className="hidden lg:inline ">创建问题</span>*/}
                    {/*</Button>*/}
                    <WithPermission required={ProjectRole.ADMIN} projectId={projectId}>
                        <Button
                            variant="outline"
                            onClick={batchDeleteQuestions}
                            disabled={Object.keys(rowSelection).length == 0}
                            className={'text-red-500 hover:cursor-pointer hover:text-red-500'}
                        >
                            <Trash2 size={30} />
                            <span className="hidden lg:inline ">{t('delete_btn')}</span>
                        </Button>
                    </WithPermission>
                    <WithPermission required={ProjectRole.EDITOR} projectId={projectId}>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setOpen(true);
                            }}
                            disabled={Object.keys(rowSelection).length == 0}
                            className={'hover:cursor-pointer'}
                        >
                            <Wand size={30} />
                            <span className="hidden lg:inline ">{t('gen_btn')}</span>
                        </Button>
                    </WithPermission>
                </div>
            </div>
            <DataTable
                data={questions}
                pageCount={pageCount}
                pagination={pagination}
                setPagination={setPagination}
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                columns={columns}
                refresh={mutateQuestions}
            />
            {selectedItems.length > 0 && (
                <GenerateStrategyDialog open={open} setOpen={setOpen} promptTemplateType={PromptTemplateType.ANSWER}
                                        handleGenerate={handleGenerateDataset} />
            )}

            {questionId && (<PreferencePairDialog questionId={questionId} open={ppOpen} setOpen={setPPOpen} />)}
        </div>
    );
}
