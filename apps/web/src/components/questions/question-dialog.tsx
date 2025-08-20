'use client';

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import React, { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Tag, TagInput } from 'emblor';
import MentionsTextarea from '@/components/ui/mentions-textarea';
import { useImageBlocksByImageId } from '@/hooks/query/use-image-block';
import type { UIContextType } from '@/constants/data-dictionary';
import { ContextType } from '@repo/shared-types';
import type { ImageBlock, QuestionsWithDatasetSample } from '@/types/interfaces';
import apiClient from '@/lib/axios';

const formSchema = z.object({
    id: z.string(),
    question: z.string().min(2, {
        message: '问题至少需要2个字符'
    }),
    label: z.string(),
    contextType: z.nativeEnum(ContextType)
});

type FormValues = z.infer<typeof formSchema>;

export function QuestionDialog({
                                   item,
                                   refresh,
                                   children
                               }: {
    item: QuestionsWithDatasetSample;
    refresh: () => void;
    children?: ReactNode;
}) {
    const { projectId }: { projectId: string } = useParams();
    const { t } = useTranslation('question');
    const { data: imageBlocks = [] } = useImageBlocksByImageId(
        projectId,
        item.contextId,
        item.contextType as UIContextType
    );

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: item.id,
            question: item.question,
            label: item.label,
            contextType: item.contextType as ContextType
        }
    });
    const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
    const [tags, setTags] = useState<Tag[]>(
        item.label
            .split(',')
            .filter(Boolean)
            .map(tag => ({
                id: tag,
                text: tag
            }))
    );
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // 准备提及数据
    const mentionData = imageBlocks.map((block: ImageBlock) => ({
        id: block.id,
        display: block.label
    }));

    // 当item变化时重置表单
    useEffect(() => {
        form.reset({
            id: item.id,
            question: item.question,
            label: item.label,
            contextType: item.contextType as ContextType
        });
        setTags(
            item.label
                .split(',')
                .filter(Boolean)
                .map(tag => ({
                    id: tag,
                    text: tag
                }))
        );
    }, [item, form]);

    const onSubmit = async (values: FormValues) => {
        try {
            setIsSubmitting(true);
            const updatedValues = {
                ...values,
                label: tags.map(tag => tag.text).join(',')
            };
            toast.promise(apiClient.patch(`/${projectId}/question/update`, updatedValues), {
                loading: '修改中',
                success: () => {
                    refresh();
                    return '操作成功';
                },
                error: error => {
                    console.error('Error:', error);
                    return error.message || '操作失败';
                }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderQuestionField = () => {
        if (item.contextType === ContextType.IMAGE) {
            return (
                <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('dialog.question')}</FormLabel>
                            <FormControl>
                                <MentionsTextarea
                                    value={field.value}
                                    onChange={field.onChange}
                                    data={mentionData}
                                    className="min-h-[100px] w-full rounded-md border p-2"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            );
        }

        return (
            <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('dialog.question')}</FormLabel>
                        <FormControl>
                            <Textarea {...field} className="min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };

    return (
        <AlertDialog onOpenChange={open => !open && form.reset()}>
            <AlertDialogTrigger asChild>
                {children || (
                    <div className="flex items-center gap-2">
                        <Button variant="link" className="w-fit px-0 text-left text-foreground hover:cursor-pointer">
                            <MentionsTextarea
                                value={item.question}
                                readOnly
                                className="cursor-pointer hover:bg-accent"
                            />
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
                    <AlertDialogTitle>{t('dialog.title')}</AlertDialogTitle>
                </AlertDialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">
                        {renderQuestionField()}

                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem {...field}>
                                    <FormLabel>{t('dialog.tag')}</FormLabel>
                                    <FormControl>
                                        <TagInput
                                            tags={tags}
                                            setTags={setTags}
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

                        <div className="flex items-center justify-end gap-2 pt-4">
                            <AlertDialogCancel asChild>
                                <Button variant="outline" disabled={isSubmitting}>
                                    {t('dialog.cancel_btn')}
                                </Button>
                            </AlertDialogCancel>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? t('dialog.saving') : t('dialog.save_btn')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
