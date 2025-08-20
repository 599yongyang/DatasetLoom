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
import { useModelConfigSelect } from '@/hooks/query/use-model-config';
import { useEffect, useState, useMemo } from 'react';
import { useGetProjects } from '@/hooks/query/use-project';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProjectDialog } from '@/components/project/project-dialog';

export function ProjectSelect() {
    const { projectId } = useParams<{ projectId: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useTranslation('navigation');
    const [open, setOpen] = React.useState(false);
    const [selectedProject, setSelectedProject] = useAtom(selectedProjectAtom);
    const { refresh } = useModelConfigSelect(selectedProject);
    const { projects, isLoading } = useGetProjects();
    const [projectDialogOpen, setProjectDialogOpen] = React.useState(false);

    // 使用 useMemo 来避免不必要的重新计算
    const projectName = useMemo(() => {
        if (!selectedProject) return t('search_project');
        const project = projects.find(p => p.id === selectedProject);
        return project?.name || t('search_project');
    }, [selectedProject, projects]);

    // 同步 URL 参数和状态
    useEffect(() => {
        if (projectId && projectId !== selectedProject) {
            setSelectedProject(projectId);
        }
    }, [projectId, selectedProject, setSelectedProject]);

    const handleSelectChange = (selectedProjectId: string) => {
        // 如果点击的是当前已选中的项目，则不进行任何操作
        if (selectedProjectId === selectedProject) {
            setOpen(false);
            return;
        }

        setSelectedProject(selectedProjectId);
        setOpen(false);

        // 刷新模型列表
        void refresh();
        console.log(pathname);
        if (pathname === '/dataset-square') {
            return;
        }
        // 解析当前路径并跳转
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length > 1) {
            segments[1] = selectedProjectId;
            router.push(`/${segments.join('/')}`);
        } else {
            // 如果没有足够的路径段，直接跳转到项目首页
            router.push(`/${selectedProjectId}`);
        }
    };

    // 过滤项目列表的函数
    const [filter, setFilter] = React.useState('');
    const filteredProjects = useMemo(() => {
        if (!filter) return projects;
        return projects.filter(project =>
            project.name.toLowerCase().includes(filter.toLowerCase())
        );
    }, [projects, filter]);

    return (
        <div className="flex items-center gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[180px] justify-between"
                        size={'sm'}
                        disabled={isLoading}
                    >
                        {isLoading ? t('loading') : projectName}
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={t('search_project')}
                            className="h-9"
                            onValueChange={(value) => setFilter(value.trim())}
                        />
                        <CommandList>
                            <CommandEmpty>{t('no_found')}</CommandEmpty>
                            <CommandGroup>
                                {filteredProjects.map(project => (
                                    <CommandItem
                                        key={project.id}
                                        value={project.id}
                                        onSelect={handleSelectChange}
                                    >
                                        {project.name}
                                        <Check
                                            className={cn(
                                                'ml-auto',
                                                selectedProject === project.id ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            onClick={() => setProjectDialogOpen(true)}
                            className="h-9 w-9 shrink-0"
                            disabled={isLoading}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('quick_create')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <ProjectDialog open={projectDialogOpen} setOpen={setProjectDialogOpen} />
        </div>
    );
}
