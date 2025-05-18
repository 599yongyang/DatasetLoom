'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Eye, FileQuestion, SquareSplitVertical, Trash2, Wand } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table/data-table';
import { useDocumentsTableColumns } from '@/components/documents/table-columns';
import { useDocuments } from '@/hooks/query/use-documents';
import { UploadDialog } from '@/components/documents/upload-dialog';
import { ChunkList } from '@/components/chunks/chunk-list';
import { useChunks } from '@/hooks/query/use-chunks';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ChunkContentDialog } from '@/components/chunks/chunk-content-dialog';
import { ConfirmAlert } from '@/components/confirm-alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useGenerateQuestion } from '@/hooks/use-generate-question';
import axios from 'axios';
import { toast } from 'sonner';
import type { ChunksVO } from '@/schema/chunks';

type SelectedChunk = {
    id: string;
    name: string;
};
export default function Page() {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('document');

    const [fileName, setFileName] = useState('');
    const [fileExt, setFileExt] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });
    const { chunks, isLoading, refresh } = useChunks({
        projectId,
        pageIndex: 0,
        pageSize: 10,
        fileIds: [],
        status: ''
    });
    const [selectedChunks, setSelectedChunks] = useState<SelectedChunk[]>([]);
    // const pageCount = useMemo(() => Math.ceil(total / pagination.pageSize) || 0, [total, pagination.pageSize]);
    // const [rowSelection, setRowSelection] = useState({});
    // const columns = useDocumentsTableColumns({mutateDocuments: refreshFiles})

    const toggleChunk = (chunk: ChunksVO) => {
        setSelectedChunks(
            selectedChunks.some(c => c.id === chunk.id)
                ? selectedChunks.filter(c => c.id !== chunk.id)
                : [...selectedChunks, { id: chunk.id, name: chunk.name }]
        );
    };

    // 检查某个 chunk 是否被选中
    const isChecked = (chunkId: string) => selectedChunks.some(item => item.id === chunkId);

    const { generateSingleQuestion } = useGenerateQuestion();

    const handleDeleteChunk = async (chunkId: string) => {
        try {
            const response = await axios.delete(`/api/project/${projectId}/chunks/${chunkId}`);
            if (response.status === 200) {
                toast.success('删除成功');
                refresh();
            }
        } catch (error) {
            toast.error('删除失败');
        }
    };

    const handleGenerateQuestion = async (chunkId: string, chunkName: string) => {
        await generateSingleQuestion({ projectId, chunkId, chunkName });
        refresh();
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="sticky top-0 z-10 bg-background/80 s flex items-center justify-between gap-2">
                <div className={'flex gap-2 w-1/2'}>
                    <Input
                        className="w-1/3"
                        value={fileName}
                        onChange={e => {
                            setFileName(e.target.value);
                            setPagination({ ...pagination, pageIndex: 0 });
                        }}
                        placeholder={t('search')}
                    />
                </div>
                <div className={'flex items-center gap-2'}>
                    <Button variant="outline" className={'text-red-500 hover:cursor-pointer hover:text-red-500'}>
                        <Trash2 size={30} />
                        <span className="hidden lg:inline ">删除所选文本块</span>
                    </Button>

                    <Button variant="outline" className={'hover:cursor-pointer'}>
                        <FileQuestion size={30} />
                        <span className="hidden lg:inline ">为所选文本块生成问题</span>
                    </Button>
                </div>
            </div>
            {/*<ChunkList chunks={chunks} getChunks={refresh} projectId={projectId}/>*/}

            <div className="space-y-4">
                {chunks.map(chunk => (
                    <Card key={chunk.id} className="">
                        <CardHeader className="px-3.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id={`chunk-${chunk.id}`}
                                        checked={isChecked(chunk.id)}
                                        onCheckedChange={() => toggleChunk(chunk)}
                                    />
                                    <label htmlFor="block-1" className="font-medium text-primary">
                                        {chunk.name}
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-normal">
                                        {chunk.fileName}
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className="bg-primary/10 text-primary hover:bg-primary/20"
                                    >
                                        {chunk.size} 字符
                                    </Badge>
                                    {chunk.Questions.length > 0 && (
                                        <HoverCard>
                                            <HoverCardTrigger>
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-green-500/70 text-primary hover:bg-green-500"
                                                >
                                                    {chunk.Questions.length} 个问题
                                                </Badge>
                                            </HoverCardTrigger>
                                            <HoverCardContent className={'max-h-52 overflow-auto gap-2'}>
                                                {chunk.Questions.map((question, index) => (
                                                    <div
                                                        key={index}
                                                        className={
                                                            ' mb-1 text-sm text-muted-foreground leading-relaxed line-clamp-1'
                                                        }
                                                    >
                                                        {question.question}
                                                    </div>
                                                ))}
                                            </HoverCardContent>
                                        </HoverCard>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-3.5 py-1">
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                {chunk.content}
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-1 border-t max-h-4">
                            <ChunkContentDialog title={chunk.name} chunkContent={chunk.content}>
                                <Button variant="ghost" size="icon">
                                    <Eye />
                                </Button>
                            </ChunkContentDialog>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleGenerateQuestion(chunk.id, chunk.name)}
                            >
                                <FileQuestion />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Edit />
                            </Button>
                            <ConfirmAlert
                                title={`确认要删除【${chunk.name}】此文本块嘛？`}
                                message={'此操作不可逆，请谨慎操作！'}
                                onConfirm={() => handleDeleteChunk(chunk.id)}
                            >
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-red-500">
                                    <Trash2 />
                                </Button>
                            </ConfirmAlert>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
