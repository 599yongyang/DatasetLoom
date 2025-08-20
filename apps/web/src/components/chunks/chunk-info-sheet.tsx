import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet';
import { useParams } from 'next/navigation';
import { type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Tag, TagInput } from 'emblor';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Chunks } from '@/types/interfaces';
import apiClient from '@/lib/axios';

const formSchema = z.object({
    id: z.string(),
    name: z.string().min(2, {
        message: 'name must be at least 2 characters.'
    }),
    content: z.string(),
    tags: z.string()
});

const parseTagsToTagArray = (tagsString?: string): Tag[] => {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => ({
        id: tag.trim(),
        text: tag.trim()
    }));
};

export function ChunkInfoSheet({
                                   item,
                                   refresh,
                                   children
                               }: {
    item: Chunks;
    refresh: () => void;
    children?: ReactNode;
}) {
    const { projectId } = useParams();
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: item.id,
            name: item.name,
            content: item.content,
            tags: item.tags
        }
    });

    const [tags, setTags] = useState<Tag[]>(parseTagsToTagArray(item.tags));

    const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

    function onSubmit(values: z.infer<typeof formSchema>) {
        values.tags = tags.map(tag => tag.text).join(',');
        toast.promise(apiClient.patch(`/${projectId}/documentChunk/${values.id}`, values), {
            loading: '保存中',
            success: data => {
                setOpen(false);
                refresh();
                return '操作成功';
            },
            error: error => {
                return error.message || '操作失败';
            }
        });
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Edit />
                </Button>
            </SheetTrigger>
            <SheetContent className="p-0 w-full sm:max-w-4xl max-h-screen">
                <SheetHeader className="py-4 px-5 border-b border-border">
                    <SheetTitle>文本块详情</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                    <div className="flex flex-col gap-4  text-sm">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>文本块名称</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>标签</FormLabel>
                                            <FormControl>
                                                <TagInput
                                                    tags={tags}
                                                    setTags={newTags => {
                                                        setTags(newTags);
                                                    }}
                                                    {...field}
                                                    placeholder="Add a tag"
                                                    styleClasses={{
                                                        inlineTagsContainer:
                                                            'border-input rounded-md bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring outline-none focus-within:ring-[3px] focus-within:ring-ring/50 p-1 gap-1',
                                                        input: 'w-full min-w-[80px] shadow-none px-2 h-7',
                                                        tag: {
                                                            body: 'h-7 relative bg-background border border-input hover:bg-background rounded-md font-medium text-xs ps-2 pe-7',
                                                            closeButton:
                                                                'absolute -inset-y-px -end-px p-0 rounded-e-md flex size-7 transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-muted-foreground/80 hover:text-foreground'
                                                        }
                                                    }}
                                                    activeTagIndex={activeTagIndex}
                                                    setActiveTagIndex={setActiveTagIndex}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>文本块内容</FormLabel>

                                            <FormControl>
                                                <ScrollArea className="text-sm h-[calc(100dvh-400px)]  ">
                                                    <Textarea {...field} className="w-[calc(100%-60px)]" />
                                                </ScrollArea>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </div>
                </div>

                <div className="py-4 flex flex-1 justify-between px-5 border-t border-border">
                    <SheetClose asChild>
                        <Button type="button" variant="outline">
                            取消
                        </Button>
                    </SheetClose>
                    <SheetClose asChild>
                        <Button type="button" onClick={form.handleSubmit(onSubmit)}>
                            保存
                        </Button>
                    </SheetClose>
                </div>
            </SheetContent>
        </Sheet>
    );
}
