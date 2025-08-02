import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useParams } from 'next/navigation';
import { useGetChunkById } from '@/hooks/query/use-chunks';
import { Badge } from '@/components/ui/badge';
import { Markdown } from '@/components/chat/markdown';
import type { ChunkEntities } from '@prisma/client';

export default function GraphSheet({
    open,
    nodeId,
    setOpen
}: {
    open: boolean;
    nodeId: string;
    setOpen: (open: boolean) => void;
}) {
    const { projectId }: { projectId: string } = useParams();
    const { chunk } = useGetChunkById({ projectId, chunkId: nodeId });

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="p-0 w-full sm:max-w-4xl max-h-screen">
                <SheetHeader className="py-4 px-5 border-b border-border">
                    <SheetTitle>{chunk?.name || '未知 Chunk'}</SheetTitle>
                </SheetHeader>

                <div className="flex-1 py-0 px-5 overflow-hidden">
                    <ScrollArea className="h-[calc(100dvh-100px)] pr-3 -mr-3">
                        <div className="space-y-6">
                            {/* 标签 Tags 展示 */}
                            <section>
                                <Label>标签</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {chunk?.tags ? (
                                        chunk.tags
                                            .split(',')
                                            .map((tag: string) => tag.trim())
                                            .filter((tag: string) => tag)
                                            .map((tag: string) => (
                                                <Badge
                                                    key={tag}
                                                    variant="outline"
                                                    className="text-muted-foreground text-sm"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))
                                    ) : (
                                        <span className="text-xs text-muted-foreground">无数据</span>
                                    )}
                                </div>
                            </section>

                            {/* 实体 Entities 展示 */}
                            <section>
                                <Label>识别实体</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {chunk?.ChunkEntities && chunk.ChunkEntities.length > 0 ? (
                                        chunk.ChunkEntities.map((entity: ChunkEntities) => (
                                            <Badge
                                                key={entity.id}
                                                variant="outline"
                                                className="text-sm bg-primary/5 text-primary hover:bg-primary/10"
                                            >
                                                {entity.value}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs text-muted-foreground">无实体信息</span>
                                    )}
                                </div>
                            </section>

                            {/* 内容预览 */}
                            <section>
                                <Label>内容预览</Label>
                                <div className="border border-dashed border-gray-500 mt-2 p-3  rounded-md font-mono text-sm">
                                    <Markdown>{chunk?.content || '暂无内容'}</Markdown>
                                </div>
                            </section>
                        </div>
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    );
}
