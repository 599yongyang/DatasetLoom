'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAtom } from 'jotai';
import { selectedProjectAtom } from '@/atoms';
import { useTranslation } from 'react-i18next';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useModelConfigSelect } from '@/hooks/query/use-llm';
import { useEffect, useState } from 'react';
import { useGetProjects } from '@/hooks/query/use-project';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProjectDialog } from '@/components/project/project-dialog';

export function ProjectSelect() {
    const { projectId } = useParams<{ projectId: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useTranslation('navigation');
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(projectId);
    const [filter, setFilter] = React.useState(''); // 搜索关键词状态
    const [selectedProject, setSelectedProject] = useAtom(selectedProjectAtom);
    useModelConfigSelect(value);
    const { projects } = useGetProjects();
    const [projectDialogOpen, setProjectDialogOpen] = React.useState(false);
    const [projectName, setProjectName] = useState(t('search_project'));
    useEffect(() => {
        if (projectId !== selectedProject && projectId !== undefined) {
            setSelectedProject(projectId);
            setValue(projectId);
        }
    }, [projectId]);

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

    useEffect(() => {
        const projectName = projects.find(project => project.id === selectedProject)?.name;
        setProjectName(projectName || t('search_project'));
    }, [selectedProject, projects.length]);

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] justify-between"
                        size={'sm'}
                    >
                        {projectName}
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
                                {projects
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
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            onClick={() => setProjectDialogOpen(true)}
                            className="h-9 w-9 shrink-0 hover:cursor-pointer group-data-[collapsible=icon]:opacity-0"
                        >
                            <Plus />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('quick_create')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <ProjectDialog open={projectDialogOpen} setOpen={setProjectDialogOpen} />
        </>
    );
}
