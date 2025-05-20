'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import type { WorkFlow } from '@prisma/client';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { addDays, format, startOfDay } from 'date-fns';

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'name must be at least 2 characters.'
    }),
    description: z.string().optional(),
    runAt: z.date()
});

export default function SaveDialog({
    open,
    setOpen,
    formData,
    refresh
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    formData: WorkFlow;
    refresh?: () => void;
}) {
    const { projectId, workflowId } = useParams<{ projectId: string; workflowId: string }>();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: formData.name,
            description: formData.description ?? '',
            runAt: formData.runAt ?? startOfDay(addDays(new Date(), 1))
        }
    });

    useEffect(() => {
        form.reset({
            name: formData.name,
            description: formData.description ?? '',
            runAt: formData.runAt ?? startOfDay(addDays(new Date(), 1))
        });
    }, [formData]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        axios
            .post(`/api/project/${projectId}/workflow`, {
                nodes: formData.nodes,
                edges: formData.edges,
                projectId: projectId,
                ...values,
                id: workflowId ? workflowId : formData.id,
                runAt: new Date(values.runAt)
            })
            .then(res => {
                if (res.status === 200) {
                    toast.success('保存成功！');
                    setOpen(false);
                    if (refresh) refresh();
                    router.push(`/project/${projectId}/workflow`);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">工作流配置</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto">
                    <div className="px-6 pt-4 pb-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>名称</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="peer pe-9" type="text" />
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

                                <FormField
                                    control={form.control}
                                    name="runAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>执行时间</FormLabel>
                                            <FormControl>
                                                <DateTimePicker
                                                    {...field}
                                                    date={field.value}
                                                    setDate={date => {
                                                        field.onChange(date);
                                                    }}
                                                    fromDate={new Date()}
                                                    placeholder="选择执行时间"
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
                <DialogFooter className="border-t px-6 py-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        取消
                    </Button>
                    <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
                        保存
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
