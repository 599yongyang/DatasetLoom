'use client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, FileQuestion, Trash2 } from 'lucide-react';
import type { ChunksVO } from '@/schema/chunks';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ChunkContentDialog } from '@/components/chunks/chunk-content-dialog';
import { ConfirmAlert } from '@/components/confirm-alert';
import axios from 'axios';
import { toast } from 'sonner';
import { useGenerateQuestion } from '@/hooks/use-generate-question';
import { useAtomValue } from 'jotai/index';
import { selectedModelInfoAtom } from '@/atoms';

export function ChunkList({
    chunks,
    getChunks,
    projectId
}: {
    chunks: ChunksVO[];
    getChunks: () => void;
    projectId: string;
    selectedChunks: { id: string; name: string }[];
    onSelectedChange: (chunks: { id: string; name: string }[]) => void;
}) {
    // 切换选中状态
    // const toggleChunk = (chunk: ChunksVO) => {
    //     onSelectedChange(
    //         selectedChunks.some(c => c.id === chunk.id)
    //             ? selectedChunks.filter(c => c.id !== chunk.id)
    //             : [...selectedChunks, { id: chunk.id, name: chunk.name }]
    //     );
    // };
    //
    // // 检查某个 chunk 是否被选中
    // const isChecked = (chunkId: string) => selectedChunks.some(item => item.id === chunkId);

    const { generateSingleQuestion } = useGenerateQuestion();

    const handleDeleteChunk = async (chunkId: string) => {
        try {
            const response = await axios.delete(`/api/project/${projectId}/chunks/${chunkId}`);
            if (response.status === 200) {
                toast.success('删除成功');
                getChunks();
            }
        } catch (error) {
            toast.error('删除失败');
        }
    };

    return (
        <div className="space-y-4">
            {chunks.map(chunk => (
                <Card key={chunk.id} className="">
                    <CardHeader className="px-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                {/*<Checkbox*/}
                                {/*    id={`chunk-${chunk.id}`}*/}
                                {/*    checked={isChecked(chunk.id)}*/}
                                {/*    onCheckedChange={() => toggleChunk(chunk)}*/}
                                {/*/>*/}
                                <label htmlFor="block-1" className="font-medium text-primary">
                                    {chunk.name}
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-normal">
                                    {chunk.fileName}
                                </Badge>
                                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
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
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{chunk.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-1 border-t max-h-4">
                        <ChunkContentDialog title={chunk.name} chunkContent={chunk.content}>
                            <Button variant="ghost" size="icon">
                                <Eye />
                            </Button>
                        </ChunkContentDialog>
                        <Button variant="ghost" size="icon">
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
    );
}
