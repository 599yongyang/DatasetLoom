import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import type { QuestionsDTO } from '@/server/db/schema/questions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Tag, TagInput } from 'emblor';
import MentionsTextarea from '@/components/ui/mentions-textarea';

const formSchema = z.object({
    id: z.string(),
    question: z.string().min(2, {
        message: 'name must be at least 2 characters.'
    }),
    label: z.string()
});

export function QuestionDialog({
    item,
    getQuestions,
    children
}: {
    item: QuestionsDTO;
    getQuestions: () => void;
    children?: ReactNode;
}) {
    const { projectId } = useParams();
    const { t } = useTranslation('question');
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: item.id,
            question: item.question,
            label: item.label
        }
    });

    const [tags, setTags] = useState<Tag[]>(
        item.label.split(',').map(tag => ({
            id: tag,
            text: tag
        }))
    );
    const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

    function onSubmit(values: z.infer<typeof formSchema>) {
        const url = `/api/project/${projectId}/questions`;
        values.label = tags.map(tag => tag.text).join(',');
        const request = values.id ? axios.put(url, values) : axios.post(url, values);
        toast.promise(request, {
            loading: '保存中',
            success: data => {
                setOpen(false);
                getQuestions();
                return '操作成功';
            },
            error: error => {
                return error.response?.data?.error || '操作失败';
            }
        });
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {children || (
                    <div className={'flex items-center gap-2'}>
                        <Button variant="link" className="text-foreground w-fit px-0 text-left hover:cursor-pointer">
                            <MentionsTextarea value={item.question} />
                        </Button>
                        {item.DatasetSamples.length > 0 && (
                            <Badge variant="outline" className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3">
                                {t('answer_count', { count: item.DatasetSamples.length })}
                            </Badge>
                        )}
                    </div>
                )}
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle> {t('dialog.title')}</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="question"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('dialog.question')}</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="label"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('dialog.tag')}</FormLabel>
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
                            <div className={'flex items-center justify-between space-x-2'}>
                                <AlertDialogCancel asChild>
                                    <Button variant="outline">{t('dialog.cancel_btn')}</Button>
                                </AlertDialogCancel>
                                <Button type="submit">{t('dialog.save_btn')}</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
