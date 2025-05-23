'use client';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Trash2, Wand } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { toast } from 'sonner';
import type { Questions } from '@prisma/client';
import { useQuestionTableColumns } from '@/components/questions/table-columns';
import useQuestions from '@/hooks/query/use-questions';
import { useGenerateDataset } from '@/hooks/use-generate-dataset';
import { DatasetStrategyDialog } from '@/components/dataset/dataset-strategy-dialog';

export default function Page() {
    let { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('question');
    const { generateMultipleDataset } = useGenerateDataset();

    const [searchQuery, setSearchQuery] = useState('');
    const [answerFilter, setAnswerFilter] = useState('all');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
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
        searchQuery
    });
    const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    const [rowSelection, setRowSelection] = useState({});
    const columns = useQuestionTableColumns({ mutateQuestions });
    const [open, setOpen] = useState(false);
    const [questionList, setQuestionList] = useState<Questions[]>([]);
    /**
     * 批量删除问题
     */
    const batchDeleteQuestions = async () => {
        toast.promise(
            axios.delete(`/api/project/${projectId}/questions/batch-delete`, {
                data: { questionIds: Object.keys(rowSelection) }
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

    /**
     * 批量生成问题
     */
    const handleBatchGenerateDataset = async () => {
        if (Object.keys(rowSelection).length === 0) {
            toast.warning('请选择数据');
            return;
        }
        const questionList = questions.filter((question: Questions) => Object.keys(rowSelection).includes(question.id));
        setQuestionList(questionList);
        setOpen(true);
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="sticky top-0 z-10 bg-background/80 s flex items-center justify-between gap-2">
                <div className={'flex gap-2 w-1/2'}>
                    <Input
                        className="w-1/3"
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            setPagination({ ...pagination, pageIndex: 0 });
                        }}
                        placeholder={t('search')}
                    />
                    <Select
                        value={answerFilter}
                        onValueChange={value => {
                            setAnswerFilter(value);
                            setPagination({ ...pagination, pageIndex: 0 });
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

                    <Button
                        variant="outline"
                        onClick={batchDeleteQuestions}
                        disabled={Object.keys(rowSelection).length == 0}
                        className={'text-red-500 hover:cursor-pointer hover:text-red-500'}
                    >
                        <Trash2 size={30} />
                        <span className="hidden lg:inline ">{t('delete_btn')}</span>
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleBatchGenerateDataset}
                        disabled={Object.keys(rowSelection).length == 0}
                        className={'hover:cursor-pointer'}
                    >
                        <Wand size={30} />
                        <span className="hidden lg:inline ">{t('gen_btn')}</span>
                    </Button>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={questions}
                pageCount={pageCount}
                pagination={pagination}
                setPagination={setPagination}
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
            />

            <DatasetStrategyDialog
                type={'multiple'}
                open={open}
                setOpen={setOpen}
                questions={questionList}
                mutateQuestions={mutateQuestions}
            />
        </div>
    );
}
