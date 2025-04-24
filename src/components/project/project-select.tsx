'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAtom, useSetAtom } from 'jotai';
import { projectListAtom, selectedProjectAtom } from '@/atoms';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import axios from 'axios';
import type { ProjectsWithCounts } from '@/schema/project';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useModelConfig } from '@/hooks/use-model-config';

export function ProjectSelect() {
    const { projectId } = useParams<{ projectId: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useTranslation('navigation');
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(projectId);
    const [filter, setFilter] = React.useState(''); // 搜索关键词状态
    const [projectList, setProjectList] = useAtom(projectListAtom);
    const setSelectedProject = useSetAtom(selectedProjectAtom);
    const getProjects = async () => {
        const res = await axios.get<ProjectsWithCounts[]>('/api/project');
        setProjectList(res.data);
    };

    const handleSelectChange = (selectedProjectId: string) => {
        // 如果点击的是当前已选中的项目，则不进行任何操作
        if (selectedProjectId === value) {
            setOpen(false);
            return;
        }

        setValue(selectedProjectId);
        setSelectedProject(selectedProjectId);
        setOpen(false);

        // 解析当前路径
        const segments = pathname.split('/').filter(Boolean); // 去除空值

        // 替换第二级路径为新的 projectId
        if (segments.length > 1) {
            segments[1] = selectedProjectId;
        }

        // 特殊逻辑：如果路径中包含 'datasets' 且层级大于 3
        const datasetsIndex = segments.indexOf('datasets');
        if (datasetsIndex !== -1 && segments.length > 3) {
            // 构造新路径：只保留前两级 + 'datasets'
            const newPathSegments = [
                segments[0], // 用户名或通用前缀
                selectedProjectId, // 新的 projectId
                'datasets' // 固定跳转到 datasets 首页
            ];

            router.push(`/${newPathSegments.join('/')}`);
            return;
        }

        // 默认情况：直接更新 projectId 后跳转
        router.push(`/${segments.join('/')}`);
    };

    useModelConfig(projectId as string);

    useEffect(() => {
        if (projectList.length === 0) {
            getProjects();
        }
    }, []);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                    size={'sm'}
                >
                    {value ? projectList.find(project => project.id === value)?.name : t('search_project')}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={t('search_project')}
                        className="h-9"
                        onValueChange={e => {
                            setFilter(e.trim().toLowerCase());
                        }}
                    />
                    <CommandList>
                        <CommandEmpty>{t('no_found')}</CommandEmpty>
                        <CommandGroup>
                            {projectList
                                .filter(project => project.name.toLowerCase().includes(filter.toLowerCase()))
                                .map(project => (
                                    <CommandItem key={project.id} value={project.id} onSelect={handleSelectChange}>
                                        {project.name}
                                        <Check
                                            className={cn(
                                                'ml-auto',
                                                value === project.id ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
