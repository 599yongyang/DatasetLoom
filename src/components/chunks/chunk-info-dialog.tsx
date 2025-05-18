import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Tag, TagInput } from 'emblor';
import type { ChunksVO } from '@/schema/chunks';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Edit } from 'lucide-react';

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

export function ChunkInfoDialog({
    item,
    refresh,
    children
}: {
    item: ChunksVO;
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
            tags: item?.ChunkMetadata?.tags
        }
    });

    const [tags, setTags] = useState<Tag[]>(parseTagsToTagArray(item?.ChunkMetadata?.tags));

    const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

    function onSubmit(values: z.infer<typeof formSchema>) {
        values.tags = tags.map(tag => tag.text).join(',');
        toast.promise(axios.put(`/api/project/${projectId}/chunks/${values.id}`, values), {
            loading: '保存中',
            success: data => {
                setOpen(false);
                refresh();
                return '操作成功';
            },
            error: error => {
                return error.response?.data?.error || '操作失败';
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Edit />
                </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">文本块详情</DialogTitle>
                    <div className="overflow-y-auto p-4">
                        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>文本块名称</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} />
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
                                                    <Textarea {...field} />
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
                                </form>
                            </Form>
                        </div>
                    </div>
                </DialogHeader>
                <DialogFooter className="border-t px-6 py-4 sm:items-center">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            取消
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button type="button" onClick={form.handleSubmit(onSubmit)}>
                            保存
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
