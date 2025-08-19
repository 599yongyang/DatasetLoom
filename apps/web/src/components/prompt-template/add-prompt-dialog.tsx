'use client';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { PromptTemplateType } from '@repo/shared-types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { promptTemplateTypeOptions } from '@/constants/data-dictionary';
import { PromptTemplate } from '@/types/interfaces/prompt';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';

const formSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, {
        message: '名称至少需要2个字符'
    }),
    type: z.nativeEnum(PromptTemplateType),
    description: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export function AddPromptDialog({ item, open, setOpen }: {
    item?: PromptTemplate,
    open: boolean,
    setOpen: (open: boolean) => void
}) {
    const { projectId }: { projectId: string } = useParams();
    const router = useRouter();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: item?.id ?? '',
            name: item?.name ?? '',
            type: item?.type as PromptTemplateType,
            description: item?.description ?? ''
        }
    });

    const [isSubmitting, setIsSubmitting] = React.useState(false);


    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        toast.promise(apiClient.post(`/${projectId}/prompt-template/create`, values), {
            loading: '创建中',
            success: async res => {
                router.push(`/project/${projectId}/settings/prompt-template/${res.data.data}`);
                setOpen(false);
                return '创建成功';
            },
            error: error => {
                return error.response?.data?.error || '创建失败';
            },
            finally: () => {
                setIsSubmitting(false);
            }
        });
    };
    useEffect(() => {
        form.reset();
    }, [open]);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>创建Prompt</AlertDialogTitle>
                </AlertDialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">

                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>名称</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}></FormField>
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>所属类型</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="请选择 Prompt 所属类型" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {promptTemplateTypeOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>描述</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center justify-end gap-2 pt-4">
                            <AlertDialogCancel asChild>
                                <Button variant="outline" disabled={isSubmitting}>
                                    取消
                                </Button>
                            </AlertDialogCancel>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? '保存中..' : '保存'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
