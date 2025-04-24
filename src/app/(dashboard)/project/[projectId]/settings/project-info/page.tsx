'use client';
import { useParams } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import axios from 'axios';
import { useAtom } from 'jotai/index';
import { projectListAtom } from '@/atoms';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const formSchema = z.object({
    id: z.string(),
    name: z.string().min(2, {
        message: 'name must be at least 2 characters.'
    }),
    description: z.string()
});

export default function Page() {
    let { projectId } = useParams();
    const { t } = useTranslation('project');
    const [projectList, setProjectList] = useAtom(projectListAtom);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: '',
            name: '',
            description: ''
        }
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        toast.promise(axios.put(`/api/project/${values.id}`, values), {
            success: res => {
                setProjectList(
                    projectList.map(project => (project.id === values.id ? { ...project, ...values } : project))
                );
                return '保存成功';
            },
            error: error => {
                return error.response?.data?.error || '保存失败';
            }
        });
    }

    useEffect(() => {
        const project = projectList.find(project => project.id === projectId);
        if (project) {
            form.setValue('id', project.id);
            form.setValue('name', project.name);
            form.setValue('description', project.description);
        }
    }, []);

    return (
        <div className="@container/main flex flex-1 p-10 flex-col gap-2">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('project_info.id')}</FormLabel>
                                <FormControl>
                                    <Input disabled={true} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('project_info.name')}</FormLabel>
                                <FormControl>
                                    <Input {...field} />
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
                                <FormLabel>{t('project_info.description')}</FormLabel>
                                <FormControl>
                                    <Textarea className={'h-[300px]'} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className={'flex justify-end'}>
                        <Button type="submit">{t('project_info.btn')}</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
