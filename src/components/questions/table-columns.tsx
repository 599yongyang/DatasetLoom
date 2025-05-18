import type { ColumnDef } from '@tanstack/react-table';
import type { QuestionsDTO } from '@/schema/questions';
import { useTranslation } from 'react-i18next';
import { QuestionDialog } from '@/components/questions/question-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wand, SquarePen } from 'lucide-react';
import { ConfirmAlert } from '@/components/confirm-alert';
import axios from 'axios';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { useParams } from 'next/navigation';
import { useGenerateDataset } from '@/hooks/use-generate-dataset';

export function useQuestionTableColumns({ mutateQuestions }: { mutateQuestions: () => void }) {
    const { t } = useTranslation('question');
    const { projectId }: { projectId: string } = useParams();
    const { generateSingleDataset } = useGenerateDataset();
    const deleteQuestion = (questionId: string) => {
        toast.promise(axios.delete(`/api/project/${projectId}/questions/${questionId}`), {
            loading: '删除中...',
            success: () => {
                mutateQuestions();
                return '删除成功';
            },
            error: e => e.response?.data?.message || '删除失败'
        });
    };

    const handleGenerateDataset = async (questionId: string, questionInfo: string) => {
        await generateSingleDataset({ projectId, questionId, questionInfo });
        mutateQuestions();
    };

    const columns: ColumnDef<QuestionsDTO>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={value => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableHiding: false
        },
        {
            accessorKey: 'question',
            header: t('table_columns.question'),
            cell: ({ row }) => {
                return <QuestionDialog item={row.original} getQuestions={mutateQuestions} />;
            },
            enableHiding: false
        },
        {
            accessorKey: 'label',
            header: t('table_columns.label'),
            cell: ({ row }) => (
                <div className={'flex flex-wrap gap-2'}>
                    {row.original.label
                        ?.split(',')
                        ?.filter((tag: string) => tag.trim()) // 过滤掉空字符串
                        ?.map((tag: string) => (
                            <Badge key={tag.trim()} variant="outline" className="text-muted-foreground ">
                                {tag.trim()}
                            </Badge>
                        ))}
                </div>
            ),
            enableHiding: false
        },
        {
            accessorKey: 'chunk',
            header: t('table_columns.chunk'),
            cell: ({ row }) => (
                <Badge variant="outline" className="text-muted-foreground">
                    {row.original.chunk.name}
                </Badge>
            )
        },
        {
            accessorKey: 'createAt',
            header: t('table_columns.createAt'),
            cell: ({ row }) => <div className="w-32">{new Date(row.original.createAt).toLocaleString('zh-CN')}</div>
        },
        {
            id: 'actions',
            header: () => <div className="text-center">{t('table_columns.actions')}</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex flex-1 justify-center gap-2">
                        <QuestionDialog item={row.original} getQuestions={mutateQuestions}>
                            <Button variant="ghost" size="icon" aria-label="View">
                                <SquarePen size={30} />
                            </Button>
                        </QuestionDialog>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGenerateDataset(row.original.id, row.original.question)}
                        >
                            <Wand size={30} />
                        </Button>
                        <ConfirmAlert
                            title={t('delete_title')}
                            message={row.original.question}
                            onConfirm={() => deleteQuestion(row.original.id)}
                        />
                    </div>
                );
            }
        }
    ];

    return columns;
}
