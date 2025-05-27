import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import * as React from 'react';
import { useGetProjects } from '@/hooks/query/use-project';

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'name must be at least 2 characters.'
    }),
    description: z.string(),
    copyId: z.string()
});

export function ProjectDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
    const router = useRouter();
    const { t } = useTranslation('project');
    const { projects: projectList, refresh } = useGetProjects();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            copyId: ''
        }
    });
    const [selectOpen, setSelectOpen] = useState(false);
    const [filter, setFilter] = React.useState('');

    function onSubmit(values: z.infer<typeof formSchema>) {
        toast.promise(axios.post('/api/project', values), {
            loading: '创建项目中',
            success: data => {
                router.push(`/project/${data.data.id}/settings/model-config`);
                setOpen(false);
                refresh(data.data.data);
                return '创建成功';
            },
            error: error => {
                return error.response?.data?.error || '创建失败';
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('project_dialog.title')}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('project_dialog.name')}</FormLabel>
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
                                    <FormLabel>{t('project_dialog.description')}</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {projectList.length > 0 && (
                            <FormField
                                control={form.control}
                                name="copyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('project_dialog.reuse')}</FormLabel>
                                        <FormControl>
                                            <Popover open={selectOpen} onOpenChange={setSelectOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={selectOpen}
                                                        className="w-full justify-between"
                                                        size={'sm'}
                                                    >
                                                        {field.value
                                                            ? projectList.find(project => project.id === field.value)
                                                                  ?.name
                                                            : t('search_info')}
                                                        <ChevronsUpDown className="opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[370px] p-0">
                                                    <Command shouldFilter={false}>
                                                        <CommandInput
                                                            placeholder={t('search_info')}
                                                            className="h-9"
                                                            onValueChange={e => {
                                                                setFilter(e.trim().toLowerCase());
                                                            }}
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>{t('no_found')}</CommandEmpty>
                                                            <CommandGroup>
                                                                {projectList
                                                                    .filter(project =>
                                                                        project.name
                                                                            .toLowerCase()
                                                                            .includes(filter.toLowerCase())
                                                                    )
                                                                    .map(project => (
                                                                        <CommandItem
                                                                            key={project.id}
                                                                            value={project.id}
                                                                            onSelect={() => {
                                                                                if (project.id === field.value) {
                                                                                    field.onChange('');
                                                                                } else {
                                                                                    field.onChange(project.id);
                                                                                }
                                                                                setSelectOpen(false);
                                                                            }}
                                                                        >
                                                                            {project.name}
                                                                            <Check
                                                                                className={cn(
                                                                                    'ml-auto',
                                                                                    field.value === project.id
                                                                                        ? 'opacity-100'
                                                                                        : 'opacity-0'
                                                                                )}
                                                                            />
                                                                        </CommandItem>
                                                                    ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className={'flex items-center justify-between space-x-2'}>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    {t('project_dialog.cancel_btn')}
                                </Button>
                            </DialogClose>
                            <Button type="submit">{t('project_dialog.save_btn')}</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
